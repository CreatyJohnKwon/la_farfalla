import { testNaverSENS } from "@/src/shared/lib/naverSmsService";

export async function GET() {
    try {
        const result = await testNaverSENS();

        console.log(result);

        return Response.json({
            success: result,
            message: result ? "SMS 테스트 성공" : "SMS 테스트 실패",
        });
    } catch (error: any) {
        return Response.json(
            {
                success: false,
                error: "SMS 테스트 중 오류 발생",
                details: error.message,
            },
            { status: 500 },
        );
    }
}
