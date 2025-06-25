import { Schema, model, models } from "mongoose";
import { ICouponDocument } from "../type/interfaces";

const couponSchema = new Schema<ICouponDocument>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
            index: true,
        },
        name: { type: String, required: true },
        description: { type: String, required: true },
        type: {
            type: String,
            enum: ["common", "personal", "event"],
            required: true,
            index: true,
        },
        discountType: {
            type: String,
            enum: ["fixed", "percentage"],
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },
        startAt: { type: Date, required: true, index: true },
        endAt: { type: Date, required: true, index: true },
        isActive: { type: Boolean, default: true, index: true, required: true },

        maxUsage: { type: Number, default: null },
        maxUsagePerUser: { type: Number, default: 1 },
        currentUsage: { type: Number, default: 0 },

        applicableCategories: [
            { type: Schema.Types.ObjectId, ref: "Category" },
        ],
        applicableProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
        excludeCategories: [{ type: Schema.Types.ObjectId, ref: "Category" }],
        excludeProducts: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    },
    {
        timestamps: true,
    },
);

// 복합 인덱스
couponSchema.index({ type: 1, isActive: 1, startAt: 1, endAt: 1 });
couponSchema.index({ code: 1, isActive: 1 });

// 가상 필드
couponSchema.virtual("isValid").get(function (this: ICouponDocument) {
    const now = new Date();
    return (
        this.isActive &&
        this.startAt <= now &&
        this.endAt >= now &&
        (this.maxUsage === null || this.currentUsage < this.maxUsage)
    );
});

export const Coupon =
    models.Coupon || model<ICouponDocument>("Coupon", couponSchema);
