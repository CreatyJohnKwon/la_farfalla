"use server";

import { ObjectId } from "mongoose";
import { Coupon } from "@/src/entities/models/Coupon";
// import { Mileage } from "../../entities/models/Mileage";

export const issueWelcomeBenefits = async (userId: ObjectId) => {
    // 마일리지 추가 로직
    // await Mileage.create({
    //     userId,
    //     type: "earn",
    //     amount: 3000,
    //     description: "신규가입 적립",
    //     expiredAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1년 후
    // });

    // 첫 가입 쿠폰 (3,000원 할인 / 7일 유효)
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
