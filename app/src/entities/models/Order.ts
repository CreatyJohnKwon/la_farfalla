import mongoose, { Schema } from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        // 주문 정보
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true }, // 사용자 ID
        userNm: { type: String, required: true }, // 사용자 이름
        phoneNumber: { type: String, required: true }, // 배송지 전화번호
        address: { type: String, required: true }, // 배송지 주소
        detailAddress: { type: String, required: true }, // 배송지 상세 주소
        deliveryMemo: { type: String, required: true }, // 배송 메모
        postcode: { type: String, required: true }, // 우편번호
        items: [
            {
                productId: { type: String, required: true }, // 상품 ID
                productNm: { type: String, required: true }, // 상품 명
                size: { type: String, required: true }, // 상품 사이즈
                color: { type: String, required: true }, // 상품 색상
                quantity: { type: Number, required: true }, // 상품 수량
            },
        ],
        totalPrice: { type: Number, required: true }, // 총 금액

        // 결제 수단
        payMethod: {
            type: String,
            enum: ["간편결제", "신용카드"], // 간편결제, 신용카드
            default: "간편결제", // 주문 완료 직후
            require: true,
        },

        // 배송 상태
        shippingStatus: {
            type: String,
            enum: ["pending", "ready", "shipped", "delivered", "cancelled"],
            default: "pending", // 주문 완료 직후
            require: true,
        },
        shippedAt: { type: Date, required: false }, // 출고 일시
        trackingNumber: { type: String, required: false, default: "" }, // 운송장 번호
    },
    {
        timestamps: true,
        collection: "order",
    },
);

export default mongoose.models?.Order || mongoose.model("Order", orderSchema);
