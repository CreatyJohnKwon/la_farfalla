import { Schema, model, models } from "mongoose";

const couponSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        discountType: {
            type: String,
            enum: ["fixed", "percentage"],
            default: "fixed",
        },
        discountValue: { type: Number, required: true },
        isUsed: { type: Boolean, default: false },
        usedAt: { type: Date, default: null },
        issuedAt: { type: Date, default: Date.now },
        expiredAt: { type: Date, required: true },
        description: { type: String },
    },
    { timestamps: true },
);

export const Coupon = models.Coupon || model("Coupon", couponSchema);
