import { Payment } from "@src/entities/models/Payment";
import { Order } from "@src/entities/models/Order";
import { paymentClient } from "./portone";
import mongoose from "mongoose";
import { OrderItem } from "@src/components/order/interface";
import Product from "@src/entities/models/Product";

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

const cancelPayment = async (
    paymentId: string,
    reason: string,
    amountToCancel?: number,
) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. 포트원에 결제 취소 요청
        try {
            const cancelPayload: any = { paymentId, reason };
            if (amountToCancel) {
                cancelPayload.amount = amountToCancel;
            }
            await paymentClient.cancelPayment(cancelPayload);
        } catch (portoneError: any) {
            // 🚨 위험 지점 1: 포트원 결제 취소 실패
            // 이 경우 DB 작업은 시작도 안 했으므로, 알림만 보내고 즉시 중단합니다.
            console.error(
                `[결제 취소 실패] 포트원 API 호출에 실패했습니다. (Payment ID: ${paymentId}) 원인: ${portoneError.message}`
            );
            throw portoneError; // 에러를 다시 던져서 함수 실행을 완전히 중단
        }

        // 2. DB에서 주문 조회
        const order = await Order.findOne({ paymentId: paymentId }).session(session);

        // 3. 주문 데이터 부재 시 처리
        if (!order) {
            // 🚨🚨 가장 심각한 위험 지점 🚨🚨
            // 포트원 결제는 취소되었으나, 우리 DB에 주문이 없는 상황입니다.
            // 데이터 불일치가 이미 발생했으므로, 즉시 관리자에게 알려 수동 조치를 취하게 해야 합니다.
            console.error(
                `[긴급 데이터 불일치] 포트원 결제는 취소되었으나 DB에서 주문을 찾을 수 없습니다. 즉시 확인이 필요합니다. (Payment ID: ${paymentId})`
            );
            // 이 상황에서는 트랜잭션을 커밋할 내용이 없으므로 바로 중단합니다.
            throw new Error(`주문 정보를 찾을 수 없습니다. (Payment ID: ${paymentId})`);
        }

        // 4. 재고 복구
        await restoreStock(order.items, session);
        
        // 5. 주문 상태 변경
        order.shippingStatus = 'cancel';
        order.failReason = reason;
        await order.save({ session });

        // 6. 트랜잭션 커밋
        await session.commitTransaction();
        
        const updatedPayment = await paymentClient.getPayment({ paymentId });
        return updatedPayment;

    } catch (error: any) {
        // 🚨 위험 지점 2: DB 작업 중 오류 발생
        // 포트원 결제는 성공했으나, 재고 복구 또는 주문 상태 변경 등 DB 작업에서 오류가 발생한 경우입니다.
        // 트랜잭션을 롤백하여 DB를 원상 복구하고, 관리자에게 알려 수동 조치를 요청합니다.
        await session.abortTransaction();
        
        console.error(
            `[결제 취소 DB 오류] 포트원 결제는 취소되었으나 DB 처리 중 오류가 발생하여 롤백되었습니다. 데이터 확인이 필요합니다. (Payment ID: ${paymentId}) 오류: ${error.message}`
        );

        console.error("결제 취소 처리 중 오류:", error);
        throw error; 
    } finally {
        session.endSession();
    }
};

const restoreStock = async (items: OrderItem[], session: mongoose.ClientSession) => {
    // 1. 옵션 재고(Number 타입)만 먼저 원자적으로 복구합니다.
    const optionStockOperations = items.map(item => {
        const numericQuantity = parseInt(item.quantity as any, 10);
        if (isNaN(numericQuantity)) {
            // 복구 시에도 수량 유효성 검사는 중요합니다.
            throw new Error(`상품 ID ${item.productId}의 복구 수량이 유효하지 않습니다.`);
        }

        return {
            updateOne: {
                filter: {
                    _id: item.productId,
                    "options.colorName": item.color,
                    // 🚨 복구 시에는 재고가 충분한지 확인할 필요가 없으므로 $gte 조건을 제거합니다.
                },
                update: {
                    // ✅ 차감(-numericQuantity) -> 복구(+numericQuantity)
                    $inc: { "options.$.stockQuantity": +numericQuantity }
                }
            }
        };
    });

    // bulkWrite 자체는 동일하게 실행합니다.
    await Product.bulkWrite(optionStockOperations, { session });

    // 2. 최상위 재고(String 타입)는 별도로 조회하여 재계산 후 업데이트합니다.
    // 이 로직은 reduceStock과 100% 동일합니다.
    // 옵션 재고가 변경된 후, 그 총합을 다시 계산하여 최상위 재고를 최신 상태로 맞추는 역할이기 때문입니다.
    for (const item of items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) {
            // 재고 복구 시 상품이 없다면 로그를 남기는 것이 좋을 수 있습니다.
            console.warn(`재고 복구를 시도했으나 상품을 찾을 수 없습니다: ${item.productId}`);
            continue;
        }
        const totalQuantity = product.options.reduce((sum: number, option: any) => sum + (option.stockQuantity || 0), 0);
        product.quantity = totalQuantity.toString();
        await product.save({ session });
    }
}

export { syncPayment, verifyPayment, cancelPayment };
