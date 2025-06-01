"use server";

import { ObjectId } from "mongoose";
import { Coupon } from "@/src/entities/models/Coupon";

export const orderAccept = async (userId: ObjectId) => {
    await Coupon.create({
        userId,
        name: "신규 가입 30% 할인 쿠폰",
        code: `WELCOME-${userId.toString().slice(-6)}`,
        discountType: "percentage",
        discountValue: 30,
        expiredAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1년 후
        description: "가입 후 1년 이내 사용 가능한 쿠폰",
    });
};
