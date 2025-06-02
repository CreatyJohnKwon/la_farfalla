import { useUserQuery } from "@src/shared/hooks/react-query/useUserQuery";
import { useCouponsQuery } from "@src/shared/hooks/react-query/useBenefitQuery";
import type { Coupon } from "@src/entities/type/interfaces";
import SkeletonList from "./SkeletonList";

const CouponList = () => {
    const { data: user, isLoading: isUserLoading } = useUserQuery();
    const {
        data: coupons,
        isLoading: isCouponsLoading,
        isError,
    } = useCouponsQuery(user?._id);

    // 로딩 중엔 스켈레톤만
    if (isUserLoading || isCouponsLoading) {
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
                <li className="text-center text-red-500">쿠폰 로딩 실패</li>
            </ul>
        );
    }

    // 쿠폰이 하나라도 있을 때
    if (coupons && coupons.length > 0) {
        return (
            <ul className="flex w-[90vw] flex-col gap-4 sm:w-auto">
                {coupons.map((coupon: Coupon) => (
                    <li
                        key={coupon._id}
                        className="border border-gray-200 bg-white p-4"
                    >
                        <div className="flex justify-between">
                            <span className="font-pretendard-thin text-[0.3em] sm:text-[0.5em]">
                                {coupon.name}
                            </span>
                            <span className="text-[0.2em] text-red-500">
                                만료일:{" "}
                                {new Date(
                                    coupon.expiredAt,
                                ).toLocaleDateString()}
                            </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-600">
                            {coupon.description || "설명 없음"}
                        </p>
                        <p className="mt-1 text-xs text-gray-600">
                            {`쿠폰 코드 : ${coupon.code}`}
                        </p>
                    </li>
                ))}
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
