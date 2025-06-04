import { useQuery } from "@tanstack/react-query";
import { getCoupon, getMileage, getOrder } from "@src/shared/lib/server/user";
import { Coupon, Mileage, OrderData } from "@src/entities/type/interfaces";

const useCouponsQuery = (userId?: string) => {
    return useQuery<Coupon[], Error>({
        queryKey: ["coupons", userId],
        queryFn: () => getCoupon(userId!),
        enabled: Boolean(userId), // userId 준비되면 요청
        staleTime: 1000 * 60 * 5, // 5분 캐시
        retry: false, // 실패 시 재시도 OFF
    });
};

const useMileageQuery = (userId?: string) => {
    return useQuery<Mileage[], Error>({
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

export { useCouponsQuery, useMileageQuery, useOrderQuery };
