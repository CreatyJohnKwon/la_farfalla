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
    },
    {
        timestamps: true,
        collection: "cart",
    },
);

export default mongoose.models?.Cart || mongoose.model("Cart", cartSchema);
