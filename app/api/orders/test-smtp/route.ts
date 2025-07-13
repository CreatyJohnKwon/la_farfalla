import { EmailService } from "@/src/shared/lib/emailService";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const emailService = new EmailService();
        const isConnected = await emailService.testConnection();

        if (isConnected) {
            return NextResponse.json({
                success: true,
                message: "SMTP 연결이 성공적으로 확인되었습니다.",
            });
        } else {
            return NextResponse.json(
                {
                    success: false,
                    message: "SMTP 연결에 실패했습니다.",
                },
                { status: 500 },
            );
        }
    } catch (error) {
        console.error("SMTP 테스트 오류:", error);
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        return NextResponse.json(
            {
                success: false,
                message: "SMTP 테스트 중 오류가 발생했습니다.",
                error: errorMessage,
            },
            { status: 500 },
        );
    }
}
