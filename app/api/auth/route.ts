import { connectDB } from "@/src/entities/db/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { email, password } = await req.json();

    const db = (await connectDB).db("forum");
    const user = await db.collection("users").findOne({ email });

    if (!user) {
        return NextResponse.json(
            { error: "사용자를 찾을 수 없습니다" },
            { status: 404 },
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
