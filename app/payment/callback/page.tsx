"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useOrder from '@/src/shared/hooks/useOrder';
import { useSingleOrderQuery } from '@/src/shared/hooks/react-query/useOrderQuery';

const PaymentCallback = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { restoreItems } = useOrder();
    const orderId = searchParams.get("orderId") || "";
    const { data: orderData, isLoading } = useSingleOrderQuery(orderId);

    useEffect(() => {
        const processPayment = async () => {
            const paymentId = searchParams.get('paymentId');
            const errMessage = searchParams.get('pgMessage') || "결제 요청 처리 중 오류가 발생했습니다.";
            const errCode = searchParams.get('code');

            if (!orderData) return null;

            if (!paymentId) {
                alert('주문 정보를 찾을 수 없습니다.\nQ&A 채널로 문의해주세요.');
                orderData.items && await restoreItems(orderData.items);
                router.replace("/order");
                return;
            }

            // 에러 발생 시
            if (errCode) {
                switch (errCode) {
                    case "FAILURE_TYPE_PG":
                    case "PG_PROVIDER_ERROR":
                        alert(errMessage);
                        await restoreItems(orderData.items);
                        router.replace("/order");
                        return;
                    default:
                        alert(`${errMessage}\nQ&A 채널로 문의해주세요.`)
                        await restoreItems(orderData.items);
                        router.replace("/order");
                        return;
                }
            }

            // 에러 없을 시, complete api 소환
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
                await restoreItems(orderData.items);
                router.replace("/order");
            }
        };

        processPayment();
    }, [orderData, router, searchParams, orderId, isLoading]);

    return (
        <div className="text-center text-black text-base font-amstel font-[500] w-full min-h-screen flex justify-center items-center">
            Loading...
        </div>
    );
}

export default PaymentCallback;