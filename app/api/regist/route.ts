import { connectDB } from "@/src/entities/models/db/mongoose";
import User from "@/src/entities/models/User";
import { issueWelcomeBenefits } from "@/src/features/benefit/Benefits";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await connectDB(); // 여기는 mongoose 기반이니까 꼭 필요

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
        await issueWelcomeBenefits(newUser._id);

        return NextResponse.json({ message: "회원가입 완료" }, { status: 201 });
    } catch (err) {
        console.error("Error registering user:", err);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
}
