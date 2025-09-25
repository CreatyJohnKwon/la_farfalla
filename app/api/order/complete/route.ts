import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Order } from "@/src/entities/models/Order";
import { connectDB } from "@/src/entities/models/db/mongoose";
import { EmailService } from "@/src/shared/lib/emailService";
import { OrderData, OrderItem } from "@/src/components/order/interface";

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
            // TODO: 결제 실패 시 주문을 'failed' 상태로 변경하고 재고를 복구하는 로직 추가
            return NextResponse.json({ success: false, message: '결제가 실패했습니다.' });
        }
        
        let finalMessage = "";

        await session.withTransaction(async () => {
            const order = await Order.findOne({ _id: orderId, shippingStatus: "prepare" }).session(session);

            if (!order) throw new Error("주문 정보를 찾을 수 없습니다.");
            if (order.shippingStatus !== 'prepare') throw new Error("이미 처리된 주문입니다.");

            // 1. PortOne 결제 검증 (보안 핵심)
            const isVerified = await verifyPortOnePayment(paymentId, order.totalPrice);
            if (!isVerified) {
                // 🚨 결제 금액 위변조 의심!
                // TODO: PortOne 결제 취소 API 호출
                throw new Error("결제 검증에 실패했습니다.");
            }

            // 2. 주문 상태 'paid'로 변경
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