import mongoose from "mongoose";

const seasonSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        key: { type: Number, required: true },
        year: { type: String, required: true },
    },
    { timestamps: true, collection: "season" },
);

export default mongoose.models?.Shop || mongoose.model("Season", seasonSchema);
