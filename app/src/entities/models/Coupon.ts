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
        description: String,
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
        allowDuplicate: { type: Boolean, default: false },

        isActive: { type: Boolean, default: true, index: true },
        maxUsage: { type: Number, default: null },
        maxUsagePerUser: { type: Number, default: 1 },
        currentUsage: { type: Number, default: 0 },
        minOrderAmount: { type: Number, default: 0 },
        maxDiscountAmount: { type: Number, default: null },

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

// pre-save hook으로 validation (TypeScript 안전)
couponSchema.pre("save", function (next) {
    if (this.discountType === "percentage" && this.discountValue > 100) {
        const error = new Error("퍼센트 할인은 100을 초과할 수 없습니다.");
        return next(error);
    }

    if (this.startAt >= this.endAt) {
        const error = new Error("시작일은 종료일보다 빨라야 합니다.");
        return next(error);
    }

    next();
});

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
