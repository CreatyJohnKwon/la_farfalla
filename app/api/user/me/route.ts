import { getAuthSession } from "@src/shared/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import User from "@src/entities/models/User";
import { UserProfileData } from "@src/entities/type/interfaces";
import bcrypt from "bcryptjs";
import mongoose, { isValidObjectId } from "mongoose";
import { UserCoupon } from "@src/entities/models/UserCoupon";
import { Review } from "@src/entities/models/Review";
import { Order } from "@src/entities/models/Order";
import { Cart } from "@src/entities/models/Cart";
import { getPostposition } from "@src/utils/commonAction";

const fieldDisplayNames: { [key: string]: string } = {
    name: "이름",
    address: "주소",
    detailAddress: "상세 주소",
    phoneNumber: "연락처",
    postcode: "우편번호",
    password: "비밀번호",
    mileage: "마일리지",
};

export async function GET() {
    const session = await getAuthSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({
        email: session.user.email,
    }).lean<UserProfileData>();

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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

    // 유효 기간 체크 (정의된 endAt 기준) - 기존 로직 그대로 유지
    const availableCoupons = userCoupons.filter((uc) => {
        const coupon = uc.couponId as any;
        return coupon && coupon.endAt && coupon.endAt > now;
    });

    const result: UserProfileData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || "000-0000-0000",
        address: user.address || "",
        detailAddress: user.detailAddress || "",
        postcode: user.postcode || "000-000",
        provider: user.provider,
        reward: user.reward || 0,
        mileage: user.mileage || 0,
        coupon: availableCoupons.length,
    };

    return NextResponse.json(result);
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, ...updateData } = body;

        if (!email) {
            return NextResponse.json({
                success: false,
                message: "사용자 식별을 위한 이메일이 필요합니다.",
            }, { status: 400 });
        }

        await connectDB();
        const user = await User.findOne({ email: email });

        if (!user) {
            return NextResponse.json({
                message: "사용자를 찾을 수 없습니다.",
                success: false
            }, { status: 404 });
        }

        Object.assign(user, updateData);

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save();

        // ✨ 1. 변경된 필드의 총개수 계산
        const updatedFieldCount = Object.keys(updateData).length + (password ? 1 : 0);

        let message = "프로필이 성공적으로 수정되었습니다."; // 기본 메시지

        // ✨ 2. 변경된 필드가 하나일 경우, 특정 메시지 생성
        if (updatedFieldCount === 1) {
            // 변경된 필드의 키(key)를 찾습니다.
            const changedFieldKey = password ? 'password' : Object.keys(updateData)[0];
            // 한글 필드 이름을 가져옵니다.
            const displayName = fieldDisplayNames[changedFieldKey] || changedFieldKey;
            // 올바른 조사(이/가)를 붙여 메시지를 완성합니다.
            const postposition = getPostposition(displayName);
            message = `${displayName}${postposition} 변경되었습니다.`;
        }

        return NextResponse.json({
            success: true,
            message: message // 동적으로 생성된 메시지 반환
        });

    } catch (error) {
        console.error("PATCH /api/user/me error:", error);
        return NextResponse.json({
            success: false,
            message: "프로필 수정 중 오류가 발생했습니다."
        }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
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

    const deleteAfter = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    user.deletedAt = deleteAfter;
    await user.save();

    const objUserId = new mongoose.Types.ObjectId(userId);

    await Promise.all([
        // 기존 컬렉션들 삭제 예약
        UserCoupon.updateMany(
            { userId: objUserId },
            { $set: { deletedAt: deleteAfter } },
        ),
        Review.updateMany(
            { userId: objUserId },
            { $set: { deletedAt: deleteAfter } },
        ),
        Review.updateMany(
            { "comments.userId": objUserId },
            { $set: { "comments.$[elem].deletedAt": deleteAfter } },
            { arrayFilters: [{ "elem.userId": objUserId }] },
        ),
        Review.updateMany(
            { likedUsers: objUserId },
            { $pull: { likedUsers: objUserId } },
        ),
        Review.updateMany(
            { "comments.likedUsers": objUserId },
            { $pull: { "comments.$[].likedUsers": objUserId } },
        ),
        Order.updateMany(
            { userId: objUserId },
            { $set: { deletedAt: deleteAfter } },
        ),
        Cart.updateMany(
            { userId: objUserId },
            { $set: { deletedAt: deleteAfter } },
        ),

        // ❌ UserLike 관련 로직 제거
    ]);

    return NextResponse.json({
        message: "삭제 예약 완료 (30일 뒤 삭제 예정)",
        deletedAt: deleteAfter,
    });
}
