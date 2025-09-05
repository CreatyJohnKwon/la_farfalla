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
            <ul className="flex w-[85vw] flex-col gap-3 overflow-y-auto pb-5 sm:h-[40vh] sm:w-auto whitespace-nowrap">
                {mileage.map((item: MileageItem) => (
                    <li
                        key={item._id}
                        className="rounded-md border sm:hover:border-gray-300 p-5"
                    >
                        <div className="flex items-center justify-between">
                            <div className="w-[40vw] sm:w-[20vw] h-auto flex flex-row items-center justify-between">
                                <span className="font-amstel text-sm xs:text-base">
                                    {new Date(item.createdAt).toLocaleDateString().slice(0, -1)}
                                </span>
                                <span className="text-gray-400 font-pretendard font-[300] text-xs xs:text-sm">
                                    {item.type === "earn" ? "마일리지 적립" : "마일리지 사용"}
                                </span>
                            </div>
                            <span
                                className={`font-amstel text-base xs:text-lg ${
                                    item.type === "earn"
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {item.type === "earn" ? "+" : "-"}
                                {item.amount.toLocaleString()}P
                            </span>
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
