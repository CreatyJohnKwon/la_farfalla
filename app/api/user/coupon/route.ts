import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Coupon } from "@src/entities/models/Coupon";

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
        return NextResponse.json(
            { error: "userId is required" },
            { status: 400 },
        );
    }

    await connectDB();
    const coupons = await Coupon.find({ userId, isUsed: false }).lean();

    return NextResponse.json(coupons);
}
