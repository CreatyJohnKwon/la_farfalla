import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true }, // 사용자 ID
        userNm: { type: String, required: true }, // 사용자 이름
        items: [{
                productId: { type: String, required: true }, // 상품 ID
                size: { type: String, required: true }, // 상품 사이즈
                color: { type: String, required: true }, // 상품 색상
                quantity: { type: Number, required: true }, // 상품 수량
                price: { type: Number, required: true }, // 상품 금액
        }],
        totalPrice: { type: Number, required: true }, // 총 금액
        address: { type: String, required: true }, // 배송지 주소
        detailAddress: { type: String, required: true }, // 배송지 상세 주소
        phoneNumber: { type: String, required: true }, // 배송지 전화번호
        postcode: { type: String, required: true }, // 우편번호
    },
    {
        timestamps: true,
        collection: "order",
    },
);

export default mongoose.models?.Order || mongoose.model("Order", orderSchema);
