import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true },
        image: { type: String, required: false }, // 필수아님
        title: { type: String, required: false }, // 필수아님
        productId: { type: String, required: true },
        size: { type: String, required: true },
        color: { type: String, required: true },
        quantity: { type: Number, required: true },
        discountPrice: { type: Number, required: true },
        originalPrice: { type: Number, required: true },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: "carts",
    },
);

// TTL 유저 삭제 로직 (30일 유예)
cartSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 0 });

export const Cart = mongoose.models?.Cart || mongoose.model("Cart", cartSchema);
