import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { UserCoupon } from "@/src/entities/models/UserCoupon";
import { getAuthSession } from "@/src/shared/lib/session";
import User from "@/src/entities/models/User";
import { UserProfileData } from "@/src/entities/type/interfaces";
import { Coupon } from "@/src/entities/models/Coupon";

export async function GET(req: NextRequest) {
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
        }).lean<UserProfileData>();

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        const now = new Date();

        // ✅ 수정된 구조: 유저 발급 쿠폰 조회 (스키마에 맞춰 수정)
        const userCoupons = await UserCoupon.find({
            userId: user._id,
        })
            .populate({
                path: "couponId",
                match: {
                    endAt: { $gt: now }, // DB 레벨에서 만료된 쿠폰 필터링
                },
            })
            .lean();

        // 만료되지 않은 쿠폰만 필터링
        const availableCoupons = userCoupons.filter((uc) => {
            const coupon = uc.couponId as any;
            return coupon && coupon.endAt && coupon.endAt > now;
        });

        return NextResponse.json({
            type: "userCoupons",
            data: availableCoupons,
            count: availableCoupons.length,
        });
    } catch (error: any) {
        console.error("쿠폰 조회 중 오류:", error);
        return NextResponse.json(
            { error: "쿠폰 조회 실패", details: error.message },
            { status: 500 },
        );
    }
}

// POST - 쿠폰 발급
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
        }).lean<UserProfileData>();

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 402 },
            );
        }

        const { couponId, assignmentType = "manual" } = await req.json();

        if (!couponId) {
            return NextResponse.json(
                { error: "쿠폰 ID가 필요합니다" },
                { status: 403 },
            );
        }

        // 쿠폰 존재 여부 확인
        const coupon = await Coupon.findById(couponId);

        if (!coupon) {
            return NextResponse.json(
                { error: "존재하지 않는 쿠폰입니다" },
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
                { error: "유효하지 않은 쿠폰입니다" },
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

        // 이미 발급받았는지 확인
        const existingUserCoupon = await UserCoupon.findOne({
            userId: user._id,
            couponId: couponId,
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
            couponId: couponId,
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
            couponId: couponId,
            assignmentType: assignmentType,
            assignedAt: new Date(),
        });

        await newUserCoupon.save();

        // 쿠폰 사용량 증가
        await Coupon.findByIdAndUpdate(couponId, {
            $inc: { currentUsage: 1 },
        });

        // populate된 데이터 반환
        const populatedUserCoupon = await UserCoupon.findById(newUserCoupon._id)
            .populate("couponId")
            .lean();

        return NextResponse.json({
            message: "쿠폰이 발급되었습니다",
            data: populatedUserCoupon,
        });
    } catch (error: any) {
        console.error("쿠폰 발급 중 오류:", error);
        return NextResponse.json(
            { error: "쿠폰 발급 실패", details: error.message },
            { status: 500 },
        );
    }
}

// DELETE - 쿠폰 삭제
export async function DELETE(req: NextRequest) {
    try {
        await connectDB();

        const { _id } = await req.json();

        if (!_id) {
            return NextResponse.json(
                { error: "쿠폰 ID가 필요합니다" },
                { status: 400 },
            );
        }

        // 삭제할 UserCoupon을 먼저 조회하여 couponId 가져오기
        const userCouponToDelete = await UserCoupon.findById(_id);

        if (!userCouponToDelete) {
            return NextResponse.json(
                { error: "사용자 쿠폰 조회 결과가 없습니다" },
                { status: 404 },
            );
        }

        // UserCoupon 삭제
        const deletedUserCoupon = await UserCoupon.deleteOne({
            _id,
        });

        if (deletedUserCoupon.deletedCount === 0) {
            return NextResponse.json(
                { error: "쿠폰 삭제에 실패했습니다" },
                { status: 400 },
            );
        }

        // 쿠폰 사용량 감소 (-1)
        await Coupon.findByIdAndUpdate(userCouponToDelete.couponId, {
            $inc: { currentUsage: -1 },
        });

        return NextResponse.json({ message: "쿠폰이 삭제되었습니다" });
    } catch (error) {
        console.error("쿠폰 삭제 오류:", error);
        return NextResponse.json({ error: "쿠폰 삭제 실패" }, { status: 500 });
    }
}
