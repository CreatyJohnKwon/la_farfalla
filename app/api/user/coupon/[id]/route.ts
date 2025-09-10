import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Types } from "mongoose";
import { UserCoupon } from "@src/entities/models/UserCoupon";
import { Coupon } from "@src/entities/models/Coupon";

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const params = await context.params;
    const { id } = params;

    if (!id || !Types.ObjectId.isValid(id)) {
        return NextResponse.json(
            { error: "유효하지 않은 쿠폰 ID입니다" },
            { status: 400 },
        );
    }

    try {
        // 요청 본문 안전하게 파싱
        let body = {};
        try {
            const text = await req.text();
            if (text.trim()) {
                body = JSON.parse(text);
            }
        } catch (parseError) {
            // JSON 파싱 에러가 발생해도 기본값으로 계속 진행
            console.warn("JSON 파싱 실패, 기본값 사용:", parseError);
            body = {};
        }

        const { orderId, discountAmount } = body as any;

        await connectDB();

        const updateData: any = {
            isUsed: true,
            usedAt: new Date(),
        };

        // orderId가 제공되고 유효한 경우에만 추가
        if (orderId && Types.ObjectId.isValid(orderId)) {
            updateData.usedOrderId = orderId;
        }

        // discountAmount가 제공된 경우에만 추가
        if (discountAmount !== undefined && discountAmount >= 0) {
            updateData.discountAmount = discountAmount;
        }

        const updated = await UserCoupon.findOneAndUpdate(
            { _id: id, isUsed: false },
            updateData,
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