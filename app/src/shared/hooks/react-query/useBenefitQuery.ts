import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { getMileage } from "@src/shared/lib/server/user";
import {
    CouponResponse,
    ICoupon,
} from "@/src/entities/type/common";
import { updateCoupon } from "@src/shared/lib/server/order";
import {
    deleteCoupon,
    deleteUserCoupon,
    getCouponList,
    getManageCouponList,
    getMyCoupon,
    patchCoupon,
    postCoupon,
    postCouponCodeUserCoupon,
    postSpecialUserCoupon,
    postUserCoupon,
} from "../../lib/server/coupon";

const USER_COUPON: string = "userCoupons";
const ALL_COUPON: string = "allCoupons"
const MANAGE_COUPON: string = "manageCoupons"
const USER_MILEAGE: string = "userMileages"

// ✅ 사용자 쿠폰 조회
const useGetUserCouponsListQuery = (isforUser: boolean) => {
    return useQuery<CouponResponse, Error>({
        queryKey: [isforUser ? USER_COUPON : ALL_COUPON],
        queryFn: () => (isforUser ? getMyCoupon() : getCouponList()),
        retry: false,
    });
};

// ✅ 사용자의 사용된 쿠폰 업데이트 처리
const useUpdateUserCouponMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (couponId: string) => updateCoupon(couponId),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [USER_COUPON] }),
        onError: (error: any) =>
            alert("쿠폰 업데이트 중 오류 발생: " + error.message)
    });
};

// ✅ 사용자 쿠폰 발급 처리 (POST)
const usePostUserCouponMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: postUserCoupon,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [USER_COUPON] }),
        onError: (error: any) =>
            alert("일반 쿠폰 생성 중 오류 발생: " + error.message),
    });
};

const usePostSpecialUserCouponMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: postSpecialUserCoupon,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [USER_COUPON] }),
        onError: (error) =>
            alert("스페셜 쿠폰 생성 중 오류 발생: " + error.message),
    });
};

// 코드로 쿠폰 등록하는 뮤테이션
const usePostByCouponCodeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: postCouponCodeUserCoupon,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [USER_COUPON] }),
        onError: (error) =>
            alert("쿠폰 코드 등록 중 오류 발생: " + error.message),
    });
};

// ✅ 사용자 쿠폰 회수 처리 (DELETE)
const useDeleteUserCouponMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteUserCoupon,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [USER_COUPON] }),
        onError: (error) =>
            alert("쿠폰 삭제 중 오류 발생: " + error.message),
    });
};

// ✅ 매니지 쿠폰 GET
const useGetManageCouponsListQuery = () => {
    // 우측: 쿠폰 템플릿 조회
    return useQuery<{ data: ICoupon[]; count: number }, Error>({
        queryKey: [MANAGE_COUPON],
        queryFn: getManageCouponList,
        retry: false,
    });
};

// ✅ 매니지 쿠폰 POST
const usePostManageCouponMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: postCoupon,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [MANAGE_COUPON] }),
        onError: (error: any) =>
            alert(error.message || "쿠폰 생성 중 오류 발생"),
    });
};

// ✅ 매니지 쿠폰 PATCH
const useUpdateManageCouponMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: patchCoupon,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [MANAGE_COUPON] }),
        onError: (error) =>
            alert("어드민 쿠폰 업데이트 중 오류 발생: " + error.message),
    });
};

// ✅ 매니지 쿠폰 DELETE
const useDeleteManageCouponMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteCoupon,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: [MANAGE_COUPON] }),
        onError: (error) =>
            alert("어드민 쿠폰 삭제 중 오류 발생: " + error.message),
    });
};

// 마일리지 조회 인피니티 뮤테이션 (무한스크롤)
const useMileageQuery = (userId?: string) => {
    return useInfiniteQuery({
        queryKey: [USER_MILEAGE, userId],
        queryFn: ({ pageParam }) => getMileage({ pageParam, userId: userId! }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const limit = 5;
            if (lastPage && lastPage.length === limit) {
                return allPages.length + 1;
            }
            return undefined; 
        },
        enabled: Boolean(userId),
        retry: false,
    });
};

export {
    useMileageQuery,
    useGetUserCouponsListQuery,
    usePostUserCouponMutation,
    useUpdateUserCouponMutation,
    useDeleteUserCouponMutation,
    useGetManageCouponsListQuery,
    usePostManageCouponMutation,
    usePostSpecialUserCouponMutation,
    usePostByCouponCodeMutation,
    useUpdateManageCouponMutation,
    useDeleteManageCouponMutation,
};
