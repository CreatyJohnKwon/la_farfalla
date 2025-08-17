import { NextRequest, NextResponse } from "next/server";
import { UserCoupon } from "@/src/entities/models/UserCoupon";
import { connectDB } from "@/src/entities/models/db/mongoose";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const allCoupons = await UserCoupon.find()
            .populate("userId")
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
