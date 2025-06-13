import mongoose from "mongoose";

const seasonSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        year: { type: String, required: true },
    },
    { timestamps: true, collection: "season" },
);

export default mongoose.models?.Season ||
    mongoose.model("Season", seasonSchema);
