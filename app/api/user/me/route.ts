import { getAuthSession } from "@src/shared/lib/session";
import { NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import User from "@src/entities/models/User";
import { UserProfileData } from "@src/entities/type/interfaces";
import bcrypt from "bcryptjs";
import { UserCoupon } from "@/src/entities/models/UserCoupon";

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
        image: user.image || "",
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

export async function PATCH(req: Request) {
    const session = await getAuthSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, address, detailAddress, postcode, password, mileage } = body;

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name) user.name = name;
    if (address) user.address = address;
    if (detailAddress) user.detailAddress = detailAddress;
    if (postcode) user.postcode = postcode;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (mileage) user.mileage = mileage;

    await user.save();

    return NextResponse.json({ success: true });
}
