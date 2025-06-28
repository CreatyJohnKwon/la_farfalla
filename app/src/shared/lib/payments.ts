import { Payment } from "@/src/entities/models/Payment";
import { portone } from "./portone";
import Order from "@/src/entities/models/Order";

const syncPayment = async (paymentId: string) => {
    const existing = await Payment.findOne({ paymentId });
    if (!existing) {
        await Payment.create({ paymentId, status: "PENDING" });
    }

    const payment = await portone.payment.getPayment({ paymentId });

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

export { syncPayment, verifyPayment };
