import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/entities/models/db/mongoose";
import { Coupon } from "@/src/entities/models/Coupon";
import { Types } from "mongoose";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const params = await context.params; // 여기서 비동기 해서 파라미터를 땡겨오면 불필요한 검수 로직과 에러 확인을 하지 않아도 됨
    const { id } = params;

    if (!id || !Types.ObjectId.isValid(id)) {
        return NextResponse.json(
            { error: "유효하지 않은 쿠폰 ID입니다" },
            { status: 400 },
        );
    }

    try {
        await connectDB();
        const updated = await Coupon.findOneAndUpdate(
            { _id: new Types.ObjectId(id), isUsed: false },
            { isUsed: true, usedAt: new Date() },
            { new: true },
        );

        if (!updated) {
            return NextResponse.json(
                { message: "쿠폰이 존재하지 않거나 이미 사용됨" },
                { status: 404 },
            );
        }

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        console.error("🔥 PATCH 에러:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
