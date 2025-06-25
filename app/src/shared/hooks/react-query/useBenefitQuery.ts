import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMileage } from "@src/shared/lib/server/user";
import {
    CouponResponse,
    ICoupon,
    MileageItem,
    OrderData,
} from "@src/entities/type/interfaces";
import { getOrder, updateCoupon } from "@src/shared/lib/server/order";
import {
    deleteCoupon,
    deleteUserCoupon,
    getCouponList,
    getManageCouponList,
    getMyCoupon,
    patchCoupon,
    postCoupon,
} from "../../lib/server/coupon";

// ✅ 사용자 쿠폰 조회
const useGetUserCouponsListQuery = (type: "user" | "all") => {
    return useQuery<CouponResponse, Error>({
        queryKey: [`${type}Coupons`],
        queryFn: () => (type === "user" ? getMyCoupon() : getCouponList()),
        retry: false,
    });
};

// ✅ 사용자의 사용된 쿠폰 업데이트 처리
const useUpdateUserCouponMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (couponId: string) => updateCoupon(couponId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userCoupons"] });
        },
    });
};

// ✅ 사용자 쿠폰 회수 처리 (DELETE)
const useDeleteUserCouponMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteUserCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["userCoupons"] });
        },
    });
};

// ✅ 매니지 쿠폰 GET
const useGetManageCouponsListQuery = () => {
    // 우측: 쿠폰 템플릿 조회
    return useQuery<{ data: ICoupon[]; count: number }, Error>({
        queryKey: ["manageCoupons"],
        queryFn: getManageCouponList,
        retry: false,
        staleTime: 60000, // 1분
    });
};

// ✅ 매니지 쿠폰 POST
const usePostManageCouponMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: postCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["manageCoupons"] });
        },
        onError: (error: any) => {
            alert(error.message || "쿠폰 생성 중 오류 발생");
        },
    });
};

// ✅ 매니지 쿠폰 PATCH
const useUpdateManageCouponMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: patchCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["manageCoupons"] });
        },
    });
};

// ✅ 매니지 쿠폰 DELETE
const useDeleteManageCouponMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["manageCoupons"] });
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
    useUpdateUserCouponMutation,
    useGetUserCouponsListQuery,
    useDeleteUserCouponMutation,
    useGetManageCouponsListQuery,
    useUpdateManageCouponMutation,
    useDeleteManageCouponMutation,
    usePostManageCouponMutation,
};
