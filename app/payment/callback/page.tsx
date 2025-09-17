"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const PaymentCallback = () => {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const processPayment = async () => {
            const orderId = searchParams.get('orderId');
            const paymentId = searchParams.get('paymentId');

            if (!orderId || !paymentId) {
                alert('ERROR | 잘못된 접근입니다. 주문 정보를 찾을 수 없습니다.');
                window.history.go(-2);
                return;
            }

            try {
                const response = await fetch('/api/order/complete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId, paymentId, isSuccess: true }),
                });
                
                const result = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(result.message || '주문 처리 중 오류가 발생했습니다.');
                }
                
                // ✅ 성공 상태로 변경
                alert("SUCCESS | " + result.message || '결제가 성공적으로 완료되었습니다.');
                router.replace('/profile/order')
            } catch (error: any) {
                // ✅ 에러 상태로 변경
                alert(`ERROR | 오류가 발생했습니다: ${error.message}`);
                window.history.go(-2);
            }
        };

        processPayment();
    }, []);

    return (
        <div className="text-center text-black text-base font-pretendard font-[500] w-full min-h-screen flex justify-center items-center">
            Loading...
        </div>
    );
}

export default PaymentCallback;