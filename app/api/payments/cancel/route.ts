import { cancelPayment } from "@/src/shared/lib/payments";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { paymentId, reason, amount } = await req.json();

    try {
        if (!paymentId) {
            return NextResponse.json(
                { message: "paymentId가 필요합니다." },
                { status: 400 }
            );
        }

        await cancelPayment(paymentId, reason, amount);

        return NextResponse.json({
            message: "성공적으로 환불 되었습니다."    
        });

    } catch (error: any) {
        console.error(`API Route - 결제 취소 실패: ${error}\npaymentId: ${paymentId}`);
        return NextResponse.json({ 
                message: error.message || "서버 내부 오류가 발생했습니다."},
            { status: 500 }
        );
    }
}