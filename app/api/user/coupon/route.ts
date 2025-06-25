import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { UserCoupon } from "@/src/entities/models/UserCoupon";
import { getAuthSession } from "@/src/shared/lib/session";
import User from "@/src/entities/models/User";
import { UserProfileData } from "@/src/entities/type/interfaces";

export async function GET(req: NextRequest) {
    try {
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

        await connectDB();

        const now = new Date();

        // ✅ 수정된 구조: 유저 발급 쿠폰 조회 (스키마에 맞춰 수정)
        const userCoupons = await UserCoupon.find({
            userId: user._id,
            isUsed: false,
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
            const isValid =
                coupon && coupon.endAt && new Date(coupon.endAt) > now;
            return isValid;
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

// DELETE - 쿠폰 삭제
export async function DELETE(req: NextRequest) {
    try {
        const { _id } = await req.json();

        if (!_id) {
            return NextResponse.json(
                { error: "쿠폰 ID가 필요합니다" },
                { status: 400 },
            );
        }

        const deletedUserCoupons = await UserCoupon.deleteOne({
            _id,
        });

        if (!deletedUserCoupons) {
            return NextResponse.json(
                { error: "사용자 쿠폰 조회 결과가 없습니다" },
                { status: 404 },
            );
        }

        return NextResponse.json({ message: "쿠폰이 삭제되었습니다" });
    } catch (error) {
        console.error("쿠폰 삭제 오류:", error);
        return NextResponse.json({ error: "쿠폰 삭제 실패" }, { status: 500 });
    }
}
