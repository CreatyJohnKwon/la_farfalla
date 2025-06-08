import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCoupon, getMileage, getOrder } from "@src/shared/lib/server/user";
import { Coupon, MileageItem, OrderData } from "@src/entities/type/interfaces";
import { updateCoupon } from "@src/shared/lib/server/order";

const useCouponsQuery = (userId?: string) => {
    return useQuery<Coupon[], Error>({
        queryKey: ["coupons", userId],
        queryFn: () => getCoupon(userId!),
        enabled: Boolean(userId), // userId 준비되면 요청
        staleTime: 1000 * 60 * 5, // 5분 캐시
        retry: false, // 실패 시 재시도 OFF
    });
};

// 사용된 쿠폰 업데이트 처리
const useSpendCouponMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["coupons"] }); // 쿠폰 목록 갱신
        },
    });
};

const useMileageQuery = (userId?: string) => {
    return useQuery<MileageItem[], Error>({
        queryKey: ["mileage", userId],
        queryFn: () => getMileage(userId!),
        enabled: Boolean(userId), // userId 준비되면 요청
        staleTime: 1000 * 60 * 5, // 5분 캐시
        retry: false, // 실패 시 재시도 OFF
    });
};

const useOrderQuery = (userId?: string) => {
    return useQuery<OrderData[], Error>({
        queryKey: ["order", userId],
        queryFn: () => getOrder(userId!),
        enabled: Boolean(userId), // userId 준비되면 요청
        staleTime: 1000 * 60 * 5, // 5분 캐시
        retry: false, // 실패 시 재시도 OFF
    });
};

export {
    useCouponsQuery,
    useMileageQuery,
    useOrderQuery,
    useSpendCouponMutation,
};
