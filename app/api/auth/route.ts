import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import User from "@src/entities/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    await connectDB();
    const { email, password } = await req.json();
    const user = await User.findOne({ email });

    if (!user) {
        return NextResponse.json(
            { error: "회원정보가 없습니다\n회원가입을 진행해주세요" },
            { status: 404 },
        );
    }

    if (user && user.password === null) {
        return NextResponse.json(
            { error: "소셜 로그인 회원입니다\n간편 로그인으로 시도해주세요" },
            { status: 403 },
        );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password || "");
    if (!isPasswordValid) {
        return NextResponse.json(
            { error: "비밀번호가 틀렸습니다" },
            { status: 401 },
        );
    }

    return NextResponse.json({ message: "로그인 성공", user });
}
