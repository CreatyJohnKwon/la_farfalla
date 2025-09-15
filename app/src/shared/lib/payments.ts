import { Payment } from "@src/entities/models/Payment";
import { Order } from "@src/entities/models/Order";
import { paymentClient } from "./portone";
import mongoose from "mongoose";

const syncPayment = async (paymentId: string) => {
    const existing = await Payment.findOne({ paymentId });
    if (!existing) {
        await Payment.create({ paymentId, status: "READY" });
    }

    const payment = await paymentClient.getPayment({ paymentId });

    if (payment.status !== "PAID") return null;
    if (!verifyPayment(payment)) return null;

    await Payment.updateOne({ paymentId }, { status: "PAID" });

    return payment;
};

const verifyPayment = async (payment: any) => {
    if (payment.channel.type !== "LIVE") return false;
    if (!payment.paymentId) return false;

    // 1. 주문 정보 찾기
    const order = await Order.findById(payment.paymentId);
    if (!order) return false;

    // 2. 금액 비교
    const expectedAmount = Math.floor(order.totalPrice);
    const actualAmount = Math.floor(payment.amount.total);

    return expectedAmount === actualAmount && payment.currency === "KRW";
};

/**
 * 결제를 취소하고 데이터베이스 상태를 업데이트합니다.
 * @param paymentId: string - 취소할 결제의 ID
 *- * @param reason: string - 취소 사유
 * @param amountToCancel?: number - 취소할 금액 (부분 취소용, 없으면 전액 취소)
 */
const cancelPayment = async (
    paymentId: string,
    reason: string,
    amountToCancel?: number,
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const paymentDoc = await Payment.findOne({ paymentId }).session(session);
        if (!paymentDoc) throw new Error("결제 정보를 찾을 수 없습니다.");
        if (["CANCELLED"].includes(paymentDoc.status)) throw new Error("이미 취소 처리된 결제입니다.");

        if (!amountToCancel) {
            // 1-1 / 전체 결제 취소. 포트원에 결제 취소 요청 (이 응답에는 amount 정보가 없음)
            await paymentClient.cancelPayment({
                paymentId,
                reason,
            });
        } else {
            // 1-2 / 부분 결제 취소. 포트원에 결제 취소 요청 (이 응답에는 amount 정보가 없음)
            await paymentClient.cancelPayment({
                paymentId,
                reason,
                amount: amountToCancel
            });
        }

        // 2. ✅ 취소 후, 최신 결제 정보를 다시 조회
        const updatedPayment = await paymentClient.getPayment({ paymentId });
        
        // await restoreStock(order.items, session);
        
        await session.commitTransaction();
        return updatedPayment; // 최신 결제 정보 반환

    } catch (error) {
        await session.abortTransaction();
        console.error("결제 취소 처리 중 오류:", error);
        throw error;
    } finally {
        session.endSession();
    }
};

export { syncPayment, verifyPayment, cancelPayment };
