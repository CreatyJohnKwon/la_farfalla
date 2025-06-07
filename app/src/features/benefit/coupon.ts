"use server";

import { ObjectId } from "mongoose";
import { Coupon } from "@src/entities/models/Coupon";
import { MileageItem } from "@/src/entities/type/interfaces";
import { Mileage } from "@/src/entities/models/Mileage";

const benefitWelcomeCoupon = async (userId: ObjectId) => {
    // 첫 가입 쿠폰 (3,000원 할인 / 7일 유효)
    await Coupon.create({
        userId,
        name: "신규 가입 30% 할인",
        code: `WELCOME-${userId.toString().slice(-6)}`,
        discountType: "percentage",
        discountValue: 30,
        expiredAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1년 후
        description: "가입 후 1년 이내 사용 가능한 쿠폰",
    });
};

export { benefitWelcomeCoupon };
