import { cancelPayment } from "@/src/shared/lib/payments";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { paymentId, reason, amount } = await req.json();

        console.log(paymentId, reason, amount)

        if (!paymentId) {
            return NextResponse.json(
                { message: "paymentId가 필요합니다." },
                { status: 400 }
            );
        }

        const result = await cancelPayment(paymentId, reason, amount);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("API Route - 결제 취소 실패:", error);
        return NextResponse.json(
            { message: error.message || "서버 내부 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}