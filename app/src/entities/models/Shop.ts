import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        key: { type: Number, required: true },
        year: { type: String, required: true },
    },
    { timestamps: true, collection: "shop" },
);

export default mongoose.models?.Shop || mongoose.model("Shop", shopSchema);
