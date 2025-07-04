// app/api/payment/verify/route.js
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { paymentId, expectedAmount, orderData } = await request.json();
        
        // 포트원 결제 조회 API
        const paymentResponse = await fetch(
            `https://api.portone.io/payments/${encodeURIComponent(paymentId)}`,
            {
                headers: {
                    Authorization: `PortOne ${process.env.PORTONE_API_SECRET_KEY}`,
                },
            }
        );

        if (!paymentResponse.ok) {
            return NextResponse.json({ success: false, message: "결제 조회 실패" });
        }

        const payment = await paymentResponse.json();

        // 금액 검증
        if (payment.amount.total !== expectedAmount) {
            return NextResponse.json({ 
                success: false, 
                message: "결제 금액이 일치하지 않습니다." 
            });
        }

        // 결제 상태 확인
        if (payment.status === "PAID") {
            return NextResponse.json({ 
                success: true, 
                message: "결제 검증 완료",
                payment 
            });
        } else {
            return NextResponse.json({ 
                success: false, 
                message: "결제가 완료되지 않았습니다." 
            });
        }

    } catch (error) {
        console.error('결제 검증 오류:', error);
        return NextResponse.json({ 
            success: false, 
            message: "결제 검증 중 오류가 발생했습니다." 
        });
    }
}