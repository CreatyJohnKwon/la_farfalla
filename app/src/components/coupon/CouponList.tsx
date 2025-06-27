import {
    useGetManageCouponsListQuery,
    useGetUserCouponsListQuery,
    usePostUserCouponMutation,
} from "@src/shared/hooks/react-query/useBenefitQuery";
import SkeletonList from "./SkeletonList";
import {
    CouponResponse,
    UserCouponWithPopulate,
} from "@/src/entities/type/interfaces";

const CouponList = () => {
    // 유저가 가지고 있는 쿠폰 정보 (UserCoupon)
    const {
        data: couponResponse,
        isLoading: isCouponsLoading,
        isError,
        refetch,
    } = useGetUserCouponsListQuery("user") as {
        data: CouponResponse | undefined;
        isLoading: boolean;
        isError: boolean;
        refetch: () => void;
    };

    // 쿠폰 템플릿 정보 (Coupon)
    const {
        data: couponManageResponse,
        isLoading: isCouponManageLoading,
        isError: isCouponManageError,
    } = useGetManageCouponsListQuery();

    const mutation = usePostUserCouponMutation();

    // 쿠폰 발급 핸들러
    const handleClaimCoupon = (couponId: string) => {
        // TODO: 쿠폰 발급 API 호출
        mutation.mutate(
            { couponId },
            {
                onSuccess: () => {
                    refetch();
                    alert("쿠폰이 발급되었습니다.");
                },
            },
        );
    };

    // 로딩 중엔 스켈레톤만
    if (isCouponsLoading || isCouponManageLoading) {
        return (
            <ul className="flex w-[90vw] flex-col gap-4 sm:w-auto">
                <SkeletonList />
            </ul>
        );
    }

    // 에러
    if (isError || isCouponManageError) {
        return (
            <ul className="flex w-[90vw] flex-col gap-4 sm:w-auto">
                <li className="mt-10 text-center font-pretendard text-2xl font-[300] text-red-400">
                    쿠폰 로딩 실패
                </li>
            </ul>
        );
    }

    // 데이터 추출
    const userCoupons = couponResponse?.data || [];
    const allCoupons = couponManageResponse?.data || [];

    // 2. 보유 중이지만 미사용한 쿠폰 ID들만 추출
    const userCouponIds = new Set(
        userCoupons.map((userCoupon: UserCouponWithPopulate) =>
            typeof userCoupon.couponId === "string"
                ? userCoupon.couponId
                : userCoupon.couponId._id,
        ),
    );

    // 활성화된 쿠폰만 필터링 (현재 시간 기준으로 유효한 쿠폰)
    const validCoupons = allCoupons.filter((coupon: any) => {
        const now = new Date();
        return (
            coupon.isActive &&
            new Date(coupon.startAt) <= now &&
            new Date(coupon.endAt) >= now &&
            (coupon.maxUsage === null || coupon.currentUsage < coupon.maxUsage)
        );
    });

    // 쿠폰이 하나라도 있을 때
    if (validCoupons.length > 0) {
        return (
            <ul className="flex h-[43vh] w-[90vw] flex-col gap-4 overflow-y-auto sm:w-auto">
                {validCoupons.map((coupon: any) => {
                    const isUsed = userCoupons.find((item) =>
                        coupon.code === item.couponId.code ? item.isUsed : true,
                    );
                    if (isUsed) return;

                    const isUserOwned = userCouponIds.has(coupon._id);
                    const userCoupon = userCoupons.find(
                        (uc: UserCouponWithPopulate) =>
                            (typeof uc.couponId === "string"
                                ? uc.couponId
                                : uc.couponId._id) === coupon._id,
                    );

                    // 할인 정보 포맷팅
                    const discountText =
                        coupon.discountType === "percentage"
                            ? `${coupon.discountValue}% 할인`
                            : `${coupon.discountValue.toLocaleString()}원 할인`;

                    // 만료일 포맷팅
                    const expiryDate = (date: Date): string =>
                        new Date(date).toLocaleDateString("ko-KR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                        });

                    // 쿠폰 타입별 스타일
                    const typeColors: any = {
                        common: "bg-blue-100 text-blue-800",
                        personal: "bg-purple-100 text-purple-800",
                        event: "bg-red-100 text-red-800",
                    };

                    return (
                        <li
                            key={coupon._id}
                            className="shadow-xs rounded-lg border border-gray-200 bg-white p-4 transition-shadow hover:shadow-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    {/* 쿠폰 헤더 */}
                                    <div className="mb-3">
                                        <h3 className="font-pretendard-medium text-sm font-semibold text-gray-900 sm:text-base">
                                            {coupon.name}
                                        </h3>
                                        <div className="mt-1 flex gap-2">
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs ${typeColors[coupon.type] || "bg-gray-100 text-gray-800"}`}
                                            >
                                                {coupon.type === "common"
                                                    ? "공통"
                                                    : coupon.type === "personal"
                                                      ? "개인"
                                                      : "이벤트"}
                                            </span>
                                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                                {discountText}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 쿠폰 설명 */}
                                    <p className="mb-2 text-xs text-gray-600 sm:text-sm">
                                        {coupon.description || "설명 없음"}
                                    </p>

                                    {/* 쿠폰 코드 및 만료일 */}
                                    <p className="text-xs text-gray-500">
                                        {`쿠폰 코드: ${coupon.code}`}
                                    </p>

                                    {/* 발급 정보 (보유 중인 쿠폰만) */}
                                    {isUserOwned && userCoupon && (
                                        <div className="mt-2 flex flex-col gap-1 border-t border-gray-100 pt-2">
                                            <span className="text-xs text-gray-500">
                                                {`발급일: ${expiryDate(userCoupon.assignedAt)}`}
                                                {userCoupon.assignmentType ===
                                                    "signup" && " (가입 혜택)"}
                                            </span>
                                            <span className="text-xs text-red-400">
                                                {`만료일: ${expiryDate(coupon.endAt)}`}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* 발급 상태 및 버튼 */}
                                <div className="flex flex-col items-end justify-center">
                                    {isUserOwned ? (
                                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                            보유중
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                handleClaimCoupon(coupon._id)
                                            }
                                            className="rounded-full bg-black/60 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                                        >
                                            발급받기
                                        </button>
                                    )}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    }

    // 빈 상태
    return (
        <ul className="flex w-[90vw] flex-col gap-4 sm:w-auto">
            <li className="font-pretendard-thin mt-20 w-full text-center text-[0.5em] text-black/60">
                사용 가능한 쿠폰이 없습니다
            </li>
        </ul>
    );
};

export default CouponList;
