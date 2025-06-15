import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        title: {
            type: new mongoose.Schema(
                {
                    kr: { type: String, required: true },
                    eg: { type: String, default: "" },
                },
                { _id: false },
            ),
            required: true,
        },
        description: {
            type: new mongoose.Schema(
                {
                    image: { type: String, required: true, default: "" },
                    text: { type: String, required: true, default: "" },
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
            type: String,
            default: "0",
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
            type: String,
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
