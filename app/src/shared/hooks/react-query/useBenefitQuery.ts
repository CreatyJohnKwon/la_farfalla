import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCoupon, getMileage } from "@src/shared/lib/server/user";
import {
    IUserCouponPopulated,
    MileageItem,
    OrderData,
} from "@src/entities/type/interfaces";
import { getOrder, updateCoupon } from "@src/shared/lib/server/order";

// 유저 개인 쿠폰
const useCouponsQuery = (userId?: string) => {
    return useQuery<IUserCouponPopulated[], Error>({
        queryKey: ["userCoupons", userId],
        queryFn: async () => {
            if (!userId) throw new Error("User ID required");

            const response = await getCoupon(userId);
            if (!response.ok) throw new Error("쿠폰 조회 실패");

            const result = await response.json();
            return result.data;
        },
        enabled: Boolean(userId),
        staleTime: 1000 * 60 * 3,
        retry: false,
    });
};

// 전체 쿠폰
const useCouponsListQuery = () => {
    return useQuery<IUserCouponPopulated[], Error>({
        queryKey: ["allCoupons"],
        queryFn: () => getCoupon(),
        staleTime: 1000 * 60 * 3, // 3분 캐시
        retry: false, // 실패 시 재시도 OFF
    });
};

// 사용된 쿠폰 업데이트 처리
const useSpendCouponMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userCoupons"] }); // 쿠폰 목록 갱신
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
    useCouponsQuery,
    useMileageQuery,
    useOrderQuery,
    useSpendCouponMutation,
    useCouponsListQuery,
};
