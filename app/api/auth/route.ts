import { connectDB } from "@/src/entities/db/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    const db = (await connectDB).db("forum");
    const user = await db.collection("users").findOne({ email });

    console.log("user", user);
    console.log("email", email);

    if (!user) {
        return NextResponse.json(
            { error: "사용자를 찾을 수 없습니다" },
            { status: 404 },
        );
    }

    if (user && user.password === null) {
        return NextResponse.json(
            { error: "소셜 로그인 회원입니다\n간편 로그인으로 시도해주세요" },
            { status: 403 },
        );
    }

    if (user.password !== password) {
        return NextResponse.json(
            { error: "비밀번호가 틀렸습니다" },
            { status: 401 },
        );
    }

    return NextResponse.json({ message: "로그인 성공", user });
}
