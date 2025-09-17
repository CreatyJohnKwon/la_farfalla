import { Payment } from "@src/entities/models/Payment";
import { Order } from "@src/entities/models/Order";
import { paymentClient } from "./portone";
import mongoose from "mongoose";
import { OrderItem } from "@/src/components/order/interface";
import Product from "@/src/entities/models/Product";

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
        // 1. 포트원에 결제 취소 요청 (전체 또는 부분)
        const cancelPayload: any = { paymentId, reason };
        if (amountToCancel) {
            cancelPayload.amount = amountToCancel;
        }
        await paymentClient.cancelPayment(cancelPayload);

        // 2. ✅ paymentId를 사용하여 우리 DB에서 해당 주문 조회
        const order = await Order.findOne({ paymentId: paymentId }).session(session);

        // 3. ✅ 조회된 주문이 없으면 오류 처리
        if (!order) {
            // 포트원 결제는 취소되었지만, 우리 DB에 해당하는 주문이 없는 심각한 상황.
            // 이 경우, 수동 개입이 필요하므로 에러를 발생시키고 트랜잭션을 중단합니다.
            throw new Error(`주문 정보를 찾을 수 없습니다. (Payment ID: ${paymentId})`);
        }

        // 4. ✅ 조회된 주문의 items를 사용하여 재고 복구
        // restoreStock 함수는 이전에 만든 그대로 사용합니다.
        await restoreStock(order.items, session);
        
        // 5. ✅ 주문 상태를 'cancel'로 변경
        order.shippingStatus = 'cancel';
        order.failReason = reason; // 취소 사유 기록
        await order.save({ session });

        // 6. 트랜잭션 커밋: 모든 DB 변경사항을 한 번에 영구 저장
        await session.commitTransaction();
        
        // 7. 취소 후, 최신 결제 정보를 다시 조회하여 반환 (선택사항이지만 좋은 패턴)
        const updatedPayment = await paymentClient.getPayment({ paymentId });
        return updatedPayment;

    } catch (error) {
        // 오류 발생 시 모든 DB 변경사항 롤백
        await session.abortTransaction();
        console.error("결제 취소 처리 중 오류:", error);
        throw error; // 오류를 다시 던져서 호출한 쪽에서 처리할 수 있도록 함
    } finally {
        // 세션 종료
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
