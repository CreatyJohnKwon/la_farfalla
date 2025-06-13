import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        title: {
            type: new mongoose.Schema(
                {
                    kr: { type: String, required: true },
                    en: { type: String, default: "" },
                },
                { _id: false },
            ),
            required: true,
        },
        description: {
            type: new mongoose.Schema(
                {
                    image: { type: [String], default: [] },
                    text: { type: String, required: true },
                },
                { _id: false },
            ),
            required: true,
        },
        price: {
            type: String,
            required: true,
        },
        discount: {
            type: String, // 퍼센트지만 string으로 받기로 했으므로
            default: "0",
        },
        category: {
            type: String,
            required: true,
        },
        image: {
            type: [String],
            required: true,
        },
        colors: {
            type: [String],
            required: true,
        },
        seasonId: {
            type: mongoose.Types.ObjectId,
            unique: true,
            required: true,
        },
        size: {
            type: [String],
            required: true,
            default: [],
        },
    },
    {
        timestamps: true,
        collection: "product",
    },
);

export default mongoose.models?.Product ||
    mongoose.model("Product", productSchema);
