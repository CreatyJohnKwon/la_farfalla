import { getAuthSession } from "@/src/shared/lib/session";
import { NextResponse } from "next/server";
import { connectDB } from "@/src/entities/models/db/mongoose";
import User from "@/src/entities/models/User";
import { UserProfileData } from "@/src/entities/type/interfaces";
import bcrypt from "bcryptjs";
import { Coupon } from "@/src/entities/models/Coupon";
import { Mileage } from "@/src/entities/models/Mileage";

// GET: 유저 정보 조회
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

    // ✅ 사용하지 않았고, 아직 유효한 쿠폰들
    const availableCoupons = await Coupon.find({
        userId: user._id,
        isUsed: false,
        expiredAt: { $gt: now },
    }).lean();

    // ✅ 사용하지 않았고, 아직 유효한 마일리지
    const mileageHistory = await Mileage.find({
        userId: user._id,
        expiredAt: { $gt: now },
    }).lean();

    // 마일리지 총합 계산 (적립 - 사용)
    const totalMileage = mileageHistory.reduce((acc, m) => {
        return m.type === "earn" ? acc + m.amount : acc - m.amount;
    }, 0);

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
        mileage: totalMileage || 0,
        coupon: availableCoupons.length || 0,
    };

    return NextResponse.json(result);
}

export async function PATCH(req: Request) {
    const session = await getAuthSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, address, detailAddress, password, image } = body;

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name) user.name = name;
    if (address) user.address = address;
    if (detailAddress) user.detailAddress = detailAddress;
    if (image) user.image = image;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    return NextResponse.json({ success: true });
}
