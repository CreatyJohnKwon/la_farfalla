// models/UserCoupon.ts
import { model, models, Schema } from "mongoose";
import { IUserCouponDocument } from "../type/interfaces";

const userCouponSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        couponId: {
            type: Schema.Types.ObjectId,
            ref: "Coupon",
            required: true,
            index: true,
        },
        isUsed: { type: Boolean, default: false, index: true },
        usedAt: { type: Date, default: null },
        usedOrderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            default: null,
        },
        discountValue: { type: Number, default: null },
        discountType: {
            type: String,
            enum: ["fixed", "percentage"],
            default: null,
        },
        assignedAt: { type: Date, default: Date.now, index: true },
        assignmentType: {
            type: String,
            enum: ["manual", "auto", "event", "signup"],
            default: "manual",
        },
        endAt: {
            type: Date,
            default: null,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: "usercoupons",
    },
);

// TTL 유저 삭제 로직 (30일 유예)
userCouponSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 0 });

export const UserCoupon =
    models.UserCoupon ||
    model<IUserCouponDocument>("UserCoupon", userCouponSchema);
