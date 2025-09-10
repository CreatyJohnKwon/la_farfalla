// models/Mileage.ts
import { Schema, model, models, Types } from "mongoose";

const mileageSchema = new Schema(
    {
        userId: { type: Types.ObjectId, ref: "User", required: true },
        type: { type: String, enum: ["earn", "spend"], required: true },
        amount: { type: Number, required: true },
        description: { type: String },
        relatedOrderId: { type: Types.ObjectId, ref: "Order", default: null },
        createdAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        collection: "mileages",
    },
);

// ✅ 핵심: 이미 정의된 모델이면 그걸 재사용
export const Mileage = models.Mileage || model("Mileage", mileageSchema);
