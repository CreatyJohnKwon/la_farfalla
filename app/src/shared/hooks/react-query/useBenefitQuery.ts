import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getMyCoupon,
    getMileage,
    getCouponList,
} from "@src/shared/lib/server/user";
import {
    CouponResponse,
    MileageItem,
    OrderData,
} from "@src/entities/type/interfaces";
import { getOrder, updateCoupon } from "@src/shared/lib/server/order";

// 쿠폰 조회
const useCouponsListQuery = (type: "user" | "all") => {
    return useQuery<CouponResponse, Error>({
        queryKey: [`${type}Coupons`],
        queryFn: () => (type === "user" ? getMyCoupon() : getCouponList()),
        retry: false,
    });
};

// 사용된 쿠폰 업데이트 처리
const useSpendCouponMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (couponId: string) => updateCoupon(couponId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userCoupons"] });
        },
    });
};

const useMileageQuery = (userId?: string) => {
    return useQuery<MileageItem[], Error>({
        queryKey: ["mileage", userId],
        queryFn: () => getMileage(userId!),
        enabled: Boolean(userId), // userId 준비되면 요청
        staleTime: 1000 * 60 * 3, // 3분 캐시
        retry: false, // 실패 시 재시도 OFF
    });
};

const useOrderQuery = (userId?: string) => {
    return useQuery<OrderData[], Error>({
        queryKey: ["order-list", userId],
        queryFn: () => getOrder(userId!),
        enabled: Boolean(userId), // userId 준비되면 요청
        staleTime: 1000 * 60 * 3, // 3분 캐시
        retry: false, // 실패 시 재시도 OFF
    });
};

export {
    useMileageQuery,
    useOrderQuery,
    useSpendCouponMutation,
    useCouponsListQuery,
};
