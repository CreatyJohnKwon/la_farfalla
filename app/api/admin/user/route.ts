import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import User from "@src/entities/models/User";
import { isValidObjectId } from "mongoose";
import { UserCoupon } from "@src/entities/models/UserCoupon";
import { Review } from "@src/entities/models/Review";
import { Order } from "@src/entities/models/Order";
import { Cart } from "@src/entities/models/Cart";

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
    const objUserId = user._id;
    await user.save();

    await Promise.all([
        // 기존 컬렉션들 복구
        UserCoupon.updateMany(
            { userId: objUserId },
            { $set: { deletedAt: null } },
        ),
        Review.updateMany({ userId: objUserId }, { $set: { deletedAt: null } }),
        Review.updateMany(
            { "comments.userId": objUserId },
            { $set: { "comments.$[elem].deletedAt": null } },
            { arrayFilters: [{ "elem.userId": objUserId }] },
        ),
        Order.updateMany({ userId: objUserId }, { $set: { deletedAt: null } }),
        Cart.updateMany({ userId: objUserId }, { $set: { deletedAt: null } }),
    ]);

    return NextResponse.json({
        message: "유저 복구 완료",
        deletedAt: null,
        warning: "좋아요 정보는 복구되지 않습니다",
    });
}
