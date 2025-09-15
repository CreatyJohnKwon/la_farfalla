"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const PaymentCallback = () => {
    const searchParams = useSearchParams();

    useEffect(() => {
        const handlePaymentComplete = async () => {
            // 1. URL 쿼리에서 결제 결과 정보를 추출합니다.
            const paymentId = searchParams.get('payment_id');
            const isSuccess = searchParams.get('imp_success') === 'true';
            const pgMessage = searchParams.get('pgMessage');

            if (!paymentId || pgMessage) {
                alert(pgMessage);
                window.history.go(-2);
                return;
            }

            // 2. 서버에 최종 결제 승인 처리를 요청합니다.
            try {
                const response = await fetch('/api/orders/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ paymentId, isSuccess }),
                });

                if (!response.ok) throw new Error("결제 처리 중 오류가 발생했습니다.");
                
                const result = await response.json();
                alert(result.message);
                // 성공 시 주문 완료 페이지로 이동
                window.location.href = '/profile/order';
            } catch (error: any) {
                alert(error.message);
                // 실패 시 주문 페이지 등으로 이동
                window.history.go(-2);
            }
        };

        handlePaymentComplete();
    }, [searchParams]);

    return (
        <div className="text-center text-black text-base font-pretendard font-[500] w-full min-h-screen flex justify-center items-center">
            결제 정보를 처리 중입니다.
            잠시만 기다려주세요...
        </div>
    )
}

export default PaymentCallback;