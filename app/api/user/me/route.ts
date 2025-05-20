import { getAuthSession } from "@/src/shared/lib/session";
import { NextResponse } from "next/server";
import { connectDB } from "@/src/entities/models/db/mongoose";
import User from "@/src/entities/models/User";
import { UserProfileData } from "@/src/entities/type/interfaces";
import bcrypt from "bcryptjs";

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

    const result: UserProfileData = {
        name: user.name,
        email: user.email,
        image: user.image || "",
        phoneNumber: user.phoneNumber || "000-0000-0000",
        address: user.address || "",
        postcode: user.postcode || "000-000",
        provider: user.provider,
        reward: user.reward || 0,
    };

    return NextResponse.json(result);
}

export async function PATCH(req: Request) {
    const session = await getAuthSession();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, address, password, image } = body;

    await connectDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (name) user.name = name;
    if (address) user.address = address;
    if (image) user.image = image;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    return NextResponse.json({ success: true });
}
