import { Coupon } from "@src/entities/models/Coupon";
import { connectDB } from "@src/entities/models/db/mongoose";
import User from "@src/entities/models/User";
import { UserCoupon } from "@src/entities/models/UserCoupon";
import { ICouponDocument, UserProfileData } from "@/src/entities/type/common";
import { getAuthSession } from "@src/shared/lib/session";
import { NextRequest, NextResponse } from "next/server";

// POST - 쿠폰 코드 등록
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const session = await getAuthSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const user = await User.findOne({
            email: session.user.email,
        }).lean() as UserProfileData | null;

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 402 },
            );
        }

        const { couponCode } = await req.json();

        if (!couponCode) {
            return NextResponse.json(
                { error: "쿠폰 코드가 필요합니다" },
                { status: 403 },
            );
        }

        // 쿠폰 코드 존재 여부 확인 및 쿠폰 정보 가져오기
        const coupon = await Coupon.findOne({ code: couponCode });

        if (!coupon) {
            return NextResponse.json(
                { error: "유효하지 않은 쿠폰 코드입니다" },
                { status: 404 },
            );
        }

        // 쿠폰 유효성 검사
        const now = new Date();
        if (
            !coupon.isActive ||
            new Date(coupon.startAt) > now ||
            new Date(coupon.endAt) < now
        ) {
            return NextResponse.json(
                { error: "기간이 만료되었거나 유효하지 않은 쿠폰입니다" },
                { status: 405 },
            );
        }

        // 최대 사용량 확인
        if (
            coupon.maxUsage !== null &&
            coupon.currentUsage >= coupon.maxUsage
        ) {
            return NextResponse.json(
                { error: "쿠폰 발급 한도에 도달했습니다" },
                { status: 406 },
            );
        }

        // 이미 발급받았는지 확인 (user_id와 coupon_id로 확인)
        const existingUserCoupon = await UserCoupon.findOne({
            userId: user._id,
            couponId: coupon._id,
        });

        if (existingUserCoupon) {
            return NextResponse.json(
                { error: "이미 발급받은 쿠폰입니다" },
                { status: 407 },
            );
        }

        // 사용자별 최대 발급 수량 확인
        const userCouponCount = await UserCoupon.countDocuments({
            userId: user._id,
            couponId: coupon._id,
        });

        if (
            coupon.maxUsagePerUser &&
            userCouponCount >= coupon.maxUsagePerUser
        ) {
            return NextResponse.json(
                { error: "사용자별 발급 한도에 도달했습니다" },
                { status: 408 },
            );
        }

        // 새 UserCoupon 생성
        const newUserCoupon = new UserCoupon({
            userId: user._id,
            couponId: coupon._id,
            discountValue: coupon.discountValue,
            discountType: coupon.discountType,
            assignmentType: "event", // 코드 등록 방식을 명시
            assignedAt: new Date(),
            endAt: coupon.endAt,
        });

        await newUserCoupon.save();

        // 쿠폰 사용량 증가
        await Coupon.findByIdAndUpdate(coupon._id, {
            $inc: { currentUsage: 1 },
        });

        // populate된 데이터 반환
        const populatedUserCoupon = await UserCoupon.findById(newUserCoupon._id)
            .populate("couponId")
            .lean();

        return NextResponse.json({
            message: "쿠폰이 성공적으로 등록되었습니다",
            data: populatedUserCoupon,
        });
    } catch (error: any) {
        console.error("쿠폰 등록 중 오류:", error);
        return NextResponse.json(
            { error: "쿠폰 등록 실패", details: error.message },
            { status: 500 },
        );
    }
}
