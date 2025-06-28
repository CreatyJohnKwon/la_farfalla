import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    paymentId: { type: String, required: true, unique: true },
    status: { type: String, enum: ["PENDING", "PAID"], default: "PENDING" },
});

export const Payment =
    mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
