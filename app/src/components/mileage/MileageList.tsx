"use client";

import { useUserQuery } from "@src/shared/hooks/react-query/useUserQuery";
import { MileageItem } from "@src/entities/type/interfaces";
import { useMileageQuery } from "@src/shared/hooks/react-query/useBenefitQuery";
import SkeletonList from "./SkeletonList";

const MileageList = () => {
    const { data: user, isLoading: isUserLoading } = useUserQuery();
    const {
        data: mileage,
        isLoading: isCouponsLoading,
        isError,
    } = useMileageQuery(user?._id);

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

    // 마일리지가 하나라도 있을 때
    if (mileage && mileage.length > 0) {
        return (
            <ul className="flex w-[85vw] flex-col gap-4 overflow-y-scroll pb-5 sm:h-[40vh] sm:w-auto">
                {mileage.map((item: MileageItem) => (
                    <li
                        key={item._id}
                        className={`rounded-md border p-4 ${
                            item.type === "earn"
                                ? "border-gray-200 bg-transparent"
                                : "border-red-200 bg-red-50"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">
                                {item.type === "earn" ? "적립" : "사용"}
                            </span>
                            <span
                                className={`font-amstel text-base ${
                                    item.type === "earn"
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {item.type === "earn" ? "+" : "-"}
                                {item.amount.toLocaleString()}P
                            </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                            {item.description || "내용 없음"}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()} 발생
                        </div>
                    </li>
                ))}
            </ul>
        );
    }

    // 빈 상태
    return (
        <ul className="flex w-[90vw] flex-col gap-4 sm:w-auto">
            <li className="font-pretendard-thin mt-20 w-full text-center text-[0.5em] text-black/60">
                마일리지 내역이 없습니다
            </li>
        </ul>
    );
};

export default MileageList;
