"use server";

import { ObjectId } from "mongoose";
import { Coupon } from "@src/entities/models/Coupon";
import { UserCoupon } from "@src/entities/models/UserCoupon";

const benefitWelcomeCoupon = async (userId: ObjectId) => {
    // Step 1. 쿠폰 정의 존재 여부 확인
    let coupon = await Coupon.findOne({ code: "WELCOME_NEW_USER" });

    // Step 2. 없다면 정의 생성 (어드민이 등록한 것으로 볼 수도 있음)
    if (!coupon) {
        coupon = await Coupon.create({
            name: "신규 가입 30% 할인",
            code: "WELCOME_NEW_USER",
            type: "personal",
            discountType: "percentage",
            discountValue: 30,
            startAt: new Date(),
            endAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1년 유효
            description: "가입 후 1년 이내 사용 가능",
        });
    }

    // Step 3. 해당 유저에게 발급 (중복 방지)
    const existing = await UserCoupon.findOne({ userId, couponId: coupon._id });

    if (!existing) {
        await UserCoupon.create({
            userId,
            couponId: coupon._id,
            isUsed: false, // ✅ 명시적으로 설정
            assignedAt: new Date(),
            assignmentType: "signup",
        });
    }
};

const spendCoupon = async (userId: ObjectId, couponCode: string) => {
    const now = new Date();

    // Step 1. 쿠폰 정의 조회
    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
        throw new Error("해당 코드의 쿠폰이 존재하지 않습니다.");
    }

    // Step 2. 만료 날짜 체크 (정의 단계)
    if (coupon.endAt && coupon.endAt < now) {
        throw new Error("이 쿠폰은 이미 만료되었습니다.");
    }

    // Step 3. 유저 쿠폰 조회 + 사용 가능 여부 확인
    const userCoupon = await UserCoupon.findOne({
        userId,
        couponId: coupon._id,
    });

    if (!userCoupon) {
        throw new Error("해당 쿠폰은 이 계정에 발급되지 않았습니다.");
    }

    // ✅ isUsed 필드가 없는 경우 false로 처리
    if (userCoupon.isUsed === true) {
        throw new Error("이미 사용한 쿠폰입니다.");
    }

    // 쿠폰 사용 처리
    userCoupon.isUsed = true;
    userCoupon.usedAt = now;

    await userCoupon.save();
};

export { benefitWelcomeCoupon, spendCoupon };
