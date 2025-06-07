import { connectDB } from "@src/entities/models/db/mongoose";
import User from "@src/entities/models/User";
import { benefitWelcomeCoupon } from "@/src/features/benefit/coupon";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const { name, email, password, confirmPassword, image, provider } =
            body;

        if (!name || !email || !password || password !== confirmPassword) {
            return NextResponse.json(
                { error: "유효하지 않은 입력입니다." },
                { status: 400 },
            );
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: "이미 등록된 이메일입니다." },
                { status: 400 },
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            image,
            password: hashedPassword,
            provider: provider || "local",
            reward: 0,
            phoneNumber: "",
        });

        await newUser.save();
        await benefitWelcomeCoupon(newUser._id);

        return NextResponse.json({ message: "회원가입 완료" }, { status: 201 });
    } catch (err) {
        console.error("Error registering user:", err);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
