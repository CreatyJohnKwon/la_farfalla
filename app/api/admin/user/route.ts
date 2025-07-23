import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import User from "@src/entities/models/User";
import { isValidObjectId, Types } from "mongoose";

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId || !isValidObjectId(userId)) {
        return NextResponse.json(
            { error: "올바른 userId가 필요합니다." },
            { status: 400 },
        );
    }

    await connectDB();

    const user = await User.findById(userId).lean();

    if (!user) {
        return NextResponse.json(
            { error: "해당 유저를 찾을 수 없습니다." },
            { status: 404 },
        );
    }

    return NextResponse.json(user);
}

// 어드민 권한으로 유저 복구
export async function PATCH(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId || !isValidObjectId(userId)) {
        return NextResponse.json(
            { error: "올바른 userId가 필요합니다." },
            { status: 400 },
        );
    }

    await connectDB();

    const user = await User.findById(userId);

    if (!user) {
        return NextResponse.json(
            { error: "해당 유저를 찾을 수 없습니다." },
            { status: 404 },
        );
    }

    user.deletedAt = null;
    await user.save();

    return NextResponse.json({
        message: "삭제 예약 완료 (30일 뒤 삭제 예정)",
        deletedAt: null,
    });
}
