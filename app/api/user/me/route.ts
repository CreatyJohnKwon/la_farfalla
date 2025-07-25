import { getAuthSession } from "@src/shared/lib/session";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import User from "@src/entities/models/User";
import { UserProfileData } from "@src/entities/type/interfaces";
import bcrypt from "bcryptjs";
import mongoose, { isValidObjectId } from "mongoose";
import { UserCoupon } from "@/src/entities/models/UserCoupon";
import { Review } from "@/src/entities/models/Review";
import { UserLike } from "@/src/entities/models/UserLike";
import { Order } from "@/src/entities/models/Order";

// GET: 유저 정보 조회 (UserCoupon 기반)
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
    const body = await req.json();
    const {
        email,
        name,
        address,
        detailAddress,
        phoneNumber,
        postcode,
        password,
        mileage,
    } = body;

    await connectDB();
    const user = await User.findOne({ email: email });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name) user.name = name;
    if (address) user.address = address;
    if (detailAddress) user.detailAddress = detailAddress;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (postcode) user.postcode = postcode;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (mileage) user.mileage = mileage;

    await user.save();

    return NextResponse.json({ success: true });
}

async function checkIndexes() {
    // await mongoose.connect(process.env.MONGODB_URI!);

    // const db = mongoose.connection.db; // 타입 안전하게 분리
    // if (!db) throw new Error("DB 연결 안 됐음");

    // const indexes1 = await db.UserCoupon.indexes();
    // const indexes2 = await db.collection("userlikes").indexes();
    // const indexes3 = await db.collection("order").indexes();
    // console.log(indexes1, indexes2, indexes3);
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

    // const deleteAfter = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const deleteAfter = new Date(Date.now() + 10 * 1000);

    user.deletedAt = deleteAfter;
    await user.save();

    const objUserId = new mongoose.Types.ObjectId(userId);

    await Promise.all([
        UserCoupon.updateMany(
            { userId: objUserId },
            { $set: { deletedAt: deleteAfter } },
        ),
        Review.updateMany(
            { userId: objUserId },
            { $set: { deletedAt: deleteAfter } },
        ),
        UserLike.updateMany(
            { userId: objUserId },
            { $set: { deletedAt: deleteAfter } },
        ),
        Order.updateMany(
            { userId: objUserId },
            { $set: { deletedAt: deleteAfter } },
        ),
    ]);

    checkIndexes()

    return NextResponse.json({
        message: "삭제 예약 완료 (30일 뒤 삭제 예정)",
        deletedAt: deleteAfter,
    });
}
