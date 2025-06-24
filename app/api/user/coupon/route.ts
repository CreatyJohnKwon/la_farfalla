import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Coupon } from "@src/entities/models/Coupon";
import { UserCoupon } from "@/src/entities/models/UserCoupon";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get("userId");

    console.log("=== 쿠폰 API 호출 ===");
    console.log("받은 userId (string):", userId);

    await connectDB();

    if (userId) {
        const now = new Date();

        try {
            // ✅ string을 ObjectId로 변환
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                console.log("유효하지 않은 ObjectId:", userId);
                return NextResponse.json(
                    { error: "유효하지 않은 사용자 ID" },
                    { status: 400 },
                );
            }

            // ✅ ObjectId 타입으로 검색
            const userCoupons = await UserCoupon.find({
                "userId._id": new mongoose.Types.ObjectId(userId), // ObjectId('68598da11086104f916a937a')와 매칭
                $or: [{ isUsed: false }, { isUsed: { $exists: false } }],
            });

            console.log("userCoupons:", userCoupons);

            console.log("✅ ObjectId로 조회 성공!");
            console.log("- 조회된 UserCoupon 개수:", userCoupons.length);
            console.log("- 첫 번째 쿠폰:", userCoupons[0]);

            // 만료되지 않은 쿠폰만 필터링
            const availableCoupons = userCoupons.filter((uc) => {
                const coupon = uc.couponId as any;
                const isValid =
                    coupon && coupon.endAt && new Date(coupon.endAt) > now;
                console.log(
                    `쿠폰 ${coupon?.name || "unknown"} 유효성:`,
                    isValid,
                );
                return isValid;
            });

            console.log("최종 사용 가능한 쿠폰:", availableCoupons.length);

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

    // userId가 없으면 모든 쿠폰 조회
    else {
        try {
            const allCoupons = await Coupon.find()
                .sort({ createdAt: -1 })
                .lean();

            return NextResponse.json({
                type: "allCoupons",
                data: allCoupons,
                count: allCoupons.length,
            });
        } catch (error) {
            console.error("전체 쿠폰 조회 오류:", error);
            return NextResponse.json(
                { error: "전체 쿠폰 조회 실패" },
                { status: 500 },
            );
        }
    }
}

// ===== 추가 쿼리 파라미터 지원 버전 =====

export async function GET_ENHANCED(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get("userId");
    const includeUsed = req.nextUrl.searchParams.get("includeUsed") === "true";
    const includeExpired =
        req.nextUrl.searchParams.get("includeExpired") === "true";
    const type = req.nextUrl.searchParams.get("type"); // common, personal, event

    await connectDB();

    // 특정 유저의 쿠폰 조회
    if (userId) {
        const now = new Date();

        // 사용 여부 필터
        let usageFilter = {};
        if (!includeUsed) {
            usageFilter = {
                $or: [{ isUsed: false }, { isUsed: { $exists: false } }],
            };
        }

        const userCoupons = await UserCoupon.find({
            userId,
            ...usageFilter,
        })
            .populate({
                path: "couponId",
                model: "Coupon",
                match: type ? { type } : {}, // 쿠폰 타입 필터링
            })
            .lean();

        // null인 couponId 제거 (type 필터로 인해)
        let filteredCoupons = userCoupons.filter((uc) => uc.couponId);

        // 만료 여부 필터링
        if (!includeExpired) {
            filteredCoupons = filteredCoupons.filter((uc) => {
                const coupon = uc.couponId as any;
                return coupon && coupon.endAt && new Date(coupon.endAt) > now;
            });
        }

        return NextResponse.json({
            type: "userCoupons",
            userId,
            filters: { includeUsed, includeExpired, type },
            data: filteredCoupons,
            count: filteredCoupons.length,
        });
    }

    // 모든 쿠폰 조회
    else {
        let couponFilter: any = {};

        // 쿠폰 타입 필터
        if (type) {
            couponFilter.type = type;
        }

        const allCoupons = await Coupon.find(couponFilter)
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            type: "allCoupons",
            filters: { type },
            data: allCoupons,
            count: allCoupons.length,
        });
    }
}
