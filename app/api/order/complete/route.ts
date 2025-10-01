import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Order } from "@src/entities/models/Order";
import { connectDB } from "@src/entities/models/db/mongoose";
import { EmailService } from "@src/shared/lib/emailService";
import { OrderData, OrderItem } from "@src/components/order/interface";
import { cancelPayment } from "@/src/shared/lib/payments";
import { reduceStock } from "@/src/utils/commonAction";
import { UserCoupon } from "@/src/entities/models/UserCoupon";
import { Mileage } from "@/src/entities/models/Mileage";
import User from "@/src/entities/models/User";
import { PortOnePaymentData } from "@/src/entities/type/order";

const verifyPortOnePayment = async(
    paymentId: string, 
    txId: string, 
    expectedAmount: number
): Promise<PortOnePaymentData> => {
    try {
        const apiKey = process.env.PORTONE_API_SECRET_KEY;
        if (!apiKey) {
            throw new Error("포트원 API 키가 설정되지 않았습니다.");
        }

        // 2. 토큰을 이용해 PortOne 서버에 결제 정보 요청
        const response = await fetch(`https://api.portone.io/payments/${paymentId}`, {
            headers: { 
                'Authorization': `Portone ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // HTTP 상태 코드가 2xx가 아닌 경우
            throw new Error(`결제 정보 조회에 실패했습니다. (Payment ID: ${paymentId})`);
        }

        const payment: PortOnePaymentData = await response.json();

        // 3. (⭐️ 중요) txId 검증으로 보안 강화
        if (payment.transactionId !== txId) {
            throw new Error(`트랜잭션 ID가 일치하지 않습니다. (위조 시도 의심)`);
        }

        // 4. 결제 상태 및 금액 검증
        const status = payment.status;
        const paidAmount = payment.amount.total;

        if (status !== 'PAID' || paidAmount !== expectedAmount) {
            throw new Error(`결제 금액 또는 상태가 유효하지 않습니다. [상태: ${status}, 결제액: ${paidAmount}, 기대값: ${expectedAmount}]`);
        }

        return payment as PortOnePaymentData;

    } catch (error) {
        console.error("PortOne 결제 검증 중 예외 발생:", error);
        throw error;
    }
}

export async function POST(req: NextRequest) {
    await connectDB();
    const session = await mongoose.startSession();
    let paymentIdFromBody: string | null = null;

    try {
        const { orderId, paymentId, txId, isSuccess } = await req.json();
        paymentIdFromBody = paymentId;

        if (!isSuccess) {
            // 재고 복구 로직 추가 
            return NextResponse.json({ success: false, message: '결제를 실패했습니다.' });
        }
        
        let finalMessage = "";

        await session.withTransaction(async () => {
            const order = await Order.findOne({ _id: orderId, shippingStatus: "prepare" }).session(session);

            if (!order) throw new Error("주문 정보를 찾을 수 없거나 이미 처리된 주문입니다.");

            // PortOne 결제 검증 (보안 핵심)
            const verifiedPayment = await verifyPortOnePayment(paymentId, txId, order.totalPrice);
            if (verifiedPayment.id !== order.paymentId) {
                throw new Error("결제 번호가 일치하지 않습니다.");
            }

            // 재고 차감
            await reduceStock(order.items, session);

            // 쿠폰 사용 처리 (주문 생성 시 사용된 쿠폰이 있다면)
            if (order.discountDetails?.couponId) {
                await UserCoupon.updateOne(
                    { _id: order.discountDetails.couponId },
                    { isUsed: true, usedAt: new Date() },
                    { session }
                );
            }

            // 마일리지 차감 및 사용 내역 기록 (사용한 마일리지가 있다면)
            const usedMileage = order.discountDetails?.mileage || 0;
            if (usedMileage > 0) {
                // 마일리지 사용 내역(log) 생성
                const mileageLog = {
                    userId: order.userId,
                    type: "spend" as "spend",
                    amount: usedMileage,
                    description: `상품 구매`,
                    relatedOrderId: `${order._id}`,
                    createdAt: new Date().toISOString(),
                };
                await Mileage.create([mileageLog], { session });

                // 사용자 DB에서 마일리지 총액 차감
                await User.updateOne(
                    { _id: order.userId },
                    { $inc: { mileage: -usedMileage } },
                    { session }
                );
            }

            // 결제 성공 시, 주문 상태 'pending'(주문완료) 로 변경
            order.shippingStatus = "pending";
            order.paymentId = verifiedPayment.id;
            await order.save({ session });

            finalMessage = "주문이 성공적으로 완료되었습니다.";

            const safeOrderData: OrderData = {
                _id: order._id || `temp_${Date.now()}`,
                userId: order.userId,
                userNm: order.userNm,
                phoneNumber: order.phoneNumber || "",
                address: order.address || "",
                detailAddress: order.detailAddress || "",
                deliveryMemo: order.deliveryMemo || "",
                postcode: order.postcode || "",
                items: order.items.map((item: OrderItem) => ({
                    productId: item.productId,
                    productNm: item.productNm,
                    size: item.size,
                    color: item.color,
                    additional: item.additional,
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image
                })),
                totalPrice: order.totalPrice || 0,
                createdAt: order.createdAt || new Date().toISOString(),
                payMethod: order.payMethod || "CARD",
                paymentId: order.paymentId || "",
                shippingStatus: order.shippingStatus || "pending",
                shippedAt: order.shippedAt,
                trackingNumber: order.trackingNumber || "",
                description: order.description || ""
            };

            // 이메일 서비스 초기화
            const emailService = new EmailService();
    
            // 관리자에게 알림 메일 발송
            emailService.sendOrderNotification(safeOrderData);
        });

        return NextResponse.json({ success: true, message: finalMessage });

    } catch (error: any) {
        console.error("주문 완료 API 오류:", error.message);
        if (paymentIdFromBody) {
            try {
                await cancelPayment(paymentIdFromBody, "서버 내부 오류로 인한 자동 취소", 0); // 금액은 0으로 보내 전액 취소
                console.log(`[결제 롤백] 서버 오류로 인해 결제(ID: ${paymentIdFromBody})가 자동으로 취소되었습니다.`);
            } catch (cancelError: any) {
                console.error(`[결제 롤백 실패] 자동 취소 중 오류 발생: ${cancelError.message}`);
                // TODO: 자동 취소 실패 시 관리자에게 즉시 알림(이메일, 슬랙 등)하는 로직 필요
            }
        }
        
        return NextResponse.json(
            { success: false, message: error.message || '주문 완료 처리 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    } finally {
        await session.endSession();
    }
}