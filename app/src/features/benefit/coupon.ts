"use server";

import { ObjectId } from "mongoose";
import { Coupon } from "@src/entities/models/Coupon";

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

// 쿠폰 사용됨 로직
const spendCoupon = async (userId: ObjectId, couponCode: string) => {
    const updatedCoupon = await Coupon.findOneAndUpdate(
        {
            userId,
            code: couponCode,
            isUsed: false,
            expiredAt: { $gt: new Date() }, // 만료되지 않은 것만
        },
        {
            $set: {
                isUsed: true,
                usedAt: new Date(),
            },
        },
        { new: true },
    );

    if (!updatedCoupon) {
        throw new Error("사용 가능한 쿠폰이 없습니다.");
    }

    console.log(`coupon spend ${couponCode}, on: ${updatedCoupon.usedAt}`);
};

export { benefitWelcomeCoupon, spendCoupon };
