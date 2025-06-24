import { NextRequest, NextResponse } from "next/server";
import { Coupon } from "@src/entities/models/Coupon";

export async function GET(req: NextRequest) {
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
