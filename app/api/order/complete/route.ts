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

// PortOne 결제 검증 함수 (실제 구현 필요)
async function verifyPortOnePayment(paymentId: string, expectedAmount: number): Promise<boolean> {
    // 1. PortOne 서버에 API 요청을 보내 paymentId에 해당하는 결제 정보를 가져옵니다.
    // const response = await fetch(`https://api.portone.io/payments/${paymentId}`, {
    //   headers: { 'Authorization': `PortOne YOUR_API_KEY` }
    // });
    // const paymentData = await response.json();
    
    // 2. 실제 결제된 금액(paymentData.amount.total)과 우리 서버에 저장된 주문 금액(expectedAmount)이 일치하는지 확인합니다.
    // if (paymentData.status === 'PAID' && paymentData.amount.total === expectedAmount) {
    //     return true;
    // }
    // return false;

    // 임시로 항상 성공을 반환
    // console.log(`결제 검증 시도: ${paymentId}, 기대 금액: ${expectedAmount}`);
    return true;
}

export async function POST(req: NextRequest) {
    await connectDB();
    const session = await mongoose.startSession();

    try {
        const { orderId, paymentId, isSuccess } = await req.json();

        if (!isSuccess) {
            // 재고 복구 로직 추가 
            return NextResponse.json({ success: false, message: '결제가 실패했습니다.' });
        }
        
        let finalMessage = "";

        await session.withTransaction(async () => {
            const order = await Order.findOne({ _id: orderId, shippingStatus: "prepare" }).session(session);

            if (!order) throw new Error("주문 정보를 찾을 수 없거나 이미 처리된 주문입니다.");

            // PortOne 결제 검증 (보안 핵심)
            const isVerified = await verifyPortOnePayment(paymentId, order.totalPrice);
            if (!isVerified) {
                await cancelPayment(paymentId, "결제 검증 오류", order.totalPrice);
                throw new Error("결제 검증에 실패하여 주문을 취소했습니다.");
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
                    relatedOrderId: order._id.toString(),
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
            order.paymentId = paymentId;
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
        // TODO: 오류 발생 시 결제 취소 및 재고 롤백 로직 필요
        return NextResponse.json(
            { success: false, message: error.message || '주문 완료 처리 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    } finally {
        await session.endSession();
    }
}