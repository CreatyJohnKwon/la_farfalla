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
        discountAmount: { type: Number, default: null },
        assignedAt: { type: Date, default: Date.now, index: true },
        assignmentType: {
            type: String,
            enum: ["manual", "auto", "event", "signup"],
            default: "manual",
        },
    },
    {
        timestamps: true,
    },
);

export const UserCoupon =
    models.UserCoupon ||
    model<IUserCouponDocument>("UserCoupon", userCouponSchema);
