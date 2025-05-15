import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
    {
        userId: String,
        productId: String,
        size: String,
        color: String,
        quantity: Number,
        discountPrice: Number,
        originalPrice: Number,
        createdAt: Date,
        updatedAt: Date,
    },
    {
        timestamps: true,
        collection: "cart",
    },
);

export default mongoose.models?.Cart || mongoose.model("Cart", cartSchema);
