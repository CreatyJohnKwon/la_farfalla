import { NextResponse } from "next/server";
import { connectDB } from "@/src/entities/models/db/mongoose";
import User from "@/src/entities/models/User";
import bcrypt from "bcryptjs";
import { EmailService } from "@/src/shared/lib/emailService";

// 임시 비밀번호 생성 함수 (8자리)
const generateTempPassword = (length = 8) => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

export async function GET(req: Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // 이메일로 사용자 조회 (provider 상관없이)
        const user = await User.findOne({ email });

        if (!user) {
            // 이메일 자체가 존재하지 않는 경우
            return NextResponse.json(
                { error: "가입된 정보가 없습니다" },
                { status: 404 }
            );
        }

        // provider가 'local'인지 확인
        if (user.provider !== "local") {
            // 이메일은 존재하지만 provider가 'local'이 아닌 경우 (소셜 로그인 회원)
            return NextResponse.json(
                { error: `소셜 로그인 계정입니다 (${user.provider}).\n소셜 로그인을 통해 로그인 하시거나 채널톡으로 문의해주세요.` },
                { status: 404 }
            );
        }

        // 임시 비밀번호 생성 및 업데이트
        const tempPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        user.password = hashedPassword;
        await user.save();

        // EmailService 초기화 및 임시 비밀번호 이메일 전송
        const emailService = new EmailService();
        const emailResult = await emailService.sendTempPasswordEmail(user.email, tempPassword);

        if (emailResult.success) {
            return NextResponse.json(
                { message: "Temporary password sent to email." },
                { status: 200 }
            );
        } else {
            // 이메일 전송 실패 시
            console.error("Failed to send temporary password email:", emailResult.error);
            // 사용자에게는 일반적인 오류 메시지 전달 (보안상 상세 오류는 노출하지 않음)
            return NextResponse.json(
                { error: "Failed to send temporary password email. Please try again later." },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error("비밀번호 찾기 API 오류:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}