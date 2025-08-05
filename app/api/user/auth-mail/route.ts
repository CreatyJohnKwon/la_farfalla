import { EmailService } from "@/src/shared/lib/emailService";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email, authNumber } = await request.json();

        // 필수 데이터 검증
        if (!email || !authNumber) {
            return NextResponse.json(
                {
                    success: false,
                    message: "이메일 또는 인증번호가 누락되었습니다.",
                },
                { status: 400 },
            );
        }

        // 이메일 서비스 초기화
        const emailService = new EmailService();

        // 관리자에게 알림 메일 발송
        const result = await emailService.sendEmailAuthNotification(
            email,
            authNumber,
        );

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: authNumber,
                messageId: result.messageId,
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "이메일 인증 발송에 실패했습니다.",
                    error: result.error,
                },
                { status: 500 },
            );
        }
    } catch (error) {
        console.error("이메일 인증 발송 API 오류:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            {
                success: false,
                message: "서버 오류가 발생했습니다.",
                error: errorMessage,
            },
            { status: 500 },
        );
    }
}
