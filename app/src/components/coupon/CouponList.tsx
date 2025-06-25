import { useGetUserCouponsListQuery } from "@src/shared/hooks/react-query/useBenefitQuery";
import SkeletonList from "./SkeletonList";
import {
    CouponResponse,
    UserCouponWithPopulate,
} from "@/src/entities/type/interfaces";

const CouponList = () => {
    const {
        data: couponResponse,
        isLoading: isCouponsLoading,
        isError,
    } = useGetUserCouponsListQuery("user") as {
        data: CouponResponse | undefined;
        isLoading: boolean;
        isError: boolean;
    };

    // 로딩 중엔 스켈레톤만
    if (isCouponsLoading) {
        return (
            <ul className="flex w-[90vw] flex-col gap-4 sm:w-auto">
                <SkeletonList />
            </ul>
        );
    }

    // 에러
    if (isError) {
        return (
            <ul className="flex w-[90vw] flex-col gap-4 sm:w-auto">
                <li className="mt-10 text-center font-pretendard text-2xl font-[300] text-red-400">
                    쿠폰 로딩 실패
                </li>
            </ul>
        );
    }

    // 쿠폰 데이터 추출
    const userCoupons = couponResponse?.data || [];

    // 쿠폰이 하나라도 있을 때
    if (userCoupons.length > 0) {
        return (
            <ul className="flex h-[43vh] w-[90vw] flex-col gap-4 overflow-y-auto sm:w-auto">
                {userCoupons.map((userCoupon: UserCouponWithPopulate) => {
                    const coupon = userCoupon.couponId; // populate된 쿠폰 정보

                    // 할인 정보 포맷팅
                    const discountText =
                        coupon.discountType === "percentage"
                            ? `${coupon.discountValue}% 할인`
                            : `${coupon.discountValue.toLocaleString()}원 할인`;

                    // 만료일 포맷팅
                    const expiryDate = new Date(
                        coupon.endAt,
                    ).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                    });

                    // 쿠폰 타입별 스타일
                    const typeColors = {
                        common: "bg-blue-100 text-blue-800",
                        personal: "bg-purple-100 text-purple-800",
                        event: "bg-red-100 text-red-800",
                    };

                    return (
                        <li
                            key={userCoupon._id}
                            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                        >
                            {/* 쿠폰 헤더 */}
                            <div className="mb-3 flex items-start justify-between">
                                <div className="flex-1">
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
                                <span className="ml-2 whitespace-nowrap text-xs text-red-500">
                                    {`만료일: ${expiryDate}`}
                                </span>
                            </div>

                            {/* 쿠폰 설명 */}
                            <p className="mb-2 text-xs text-gray-600 sm:text-sm">
                                {coupon.description || "설명 없음"}
                            </p>

                            {/* 쿠폰 코드 및 추가 정보 */}
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-500">
                                    {`쿠폰 코드: ${coupon.code}`}
                                </p>
                            </div>

                            {/* 발급 정보 */}
                            <div className="mt-2 border-t border-gray-100">
                                <span className="text-xs text-gray-400">
                                    {`발급일: ${new Date(userCoupon.assignedAt).toLocaleDateString("ko-KR")}`}
                                    {userCoupon.assignmentType === "signup" &&
                                        " (가입 혜택)"}
                                </span>
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
