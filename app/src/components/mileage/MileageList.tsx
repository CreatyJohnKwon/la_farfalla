"use client";

import { useUserQuery } from "@src/shared/hooks/react-query/useUserQuery";
import { useMileageQuery } from "@src/shared/hooks/react-query/useBenefitQuery";
import SkeletonList from "./SkeletonList";
import { MileageItem } from "../order/interface";
import { useInView } from "react-intersection-observer";
import { Fragment, useEffect } from "react";
import { format } from 'date-fns';

const MileageList = () => {
    const { data: user, isLoading: isUserLoading } = useUserQuery();
    const {
        data,
        fetchNextPage, // 다음 페이지를 불러오는 함수
        hasNextPage, // 다음 페이지가 있는지 여부
        isLoading: isMileageLoading, // 첫 페이지 로딩
        isFetchingNextPage,
        isError,
    } = useMileageQuery(user?._id);

    // 스크롤 감지를 위한 ref와 inView 상태
    const { ref, inView } = useInView({
        threshold: 0, // 요소가 1px이라도 보이면 inView는 true가 됨
    });

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (inView && hasNextPage && !isFetchingNextPage) {
            timer = setTimeout(() => {
                fetchNextPage();
            }, 0);
        }

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // 로딩 처리 (첫 페이지 로딩 시)
    if (isUserLoading || isMileageLoading) {
        return (
            <ul className="flex w-[90vw] flex-col gap-3 overflow-y-auto pb-5 sm:w-auto whitespace-nowrap">
                <SkeletonList />
            </ul>
        );
    }

    // 에러
    if (isError) {
        return (
            <ul>
                <li className="font-pretendard-thin mt-16 w-full text-center text-base text-black/60">
                    마일리지 내역 에러 : Error
                </li>
            </ul>
        )
    }

    // 데이터가 없을 때
    if (!data || data.pages.every(page => page.length === 0)) {
        return (
            <ul className="flex flex-col gap-4 sm:w-auto">
                <li className="font-pretendard-thin mt-16 w-full text-center text-base text-black/60">
                    마일리지 내역이 없습니다
                </li>
            </ul>
        );
    }

    {
        return (
            <ul className="flex w-full flex-col gap-3 overflow-y-auto pb-5 sm:w-auto whitespace-nowrap">
                {data.pages.map((page, pageIndex) => (
                    // React는 fragment key를 지원하므로 key를 여기에 둡니다.
                    <Fragment key={pageIndex}>
                        {page.map((item: MileageItem) => (
                            <li 
                                key={item._id} 
                                className="rounded-md border sm:hover:border-gray-300 p-5"
                            >
                                <div className="flex items-center justify-between h-5">
                                    <span className="font-amstel text-sm xs:text-base">
                                        {format(new Date(item.createdAt), 'MM.dd HH:mm')}
                                    </span>
                                <div className="w-[52vw] sm:w-[50vw] h-5 flex flex-row items-center justify-between">
                                    <span className="text-gray-400 font-pretendard font-[300] text-xs xs:text-sm">
                                        {item.description ? item.description : item.type === "earn" ? "마일리지 적립" : "마일리지 사용"}
                                    </span>
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
                            </div>
                            </li>
                        ))}
                    </Fragment>
                ))}

                {hasNextPage && <li ref={ref} style={{ height: "1px" }} />}

                {isFetchingNextPage && <SkeletonList />}
            </ul>
        );
    }
};

export default MileageList;
