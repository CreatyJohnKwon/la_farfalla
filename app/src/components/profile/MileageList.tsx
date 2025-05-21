"use client";

import { useState } from "react";

const MileageList = () => {
    const [mileageDatas, setMileageDatas] = useState<string[] | []>([]);

    const MileageElement = () => {
        if (mileageDatas.length > 0) {
            mileageDatas.map((item: any, index: number) => {
                return <li key={`order_item_${index}`}>{item}</li>;
            });
        } else {
            return (
                <li
                    key={`order_item_none`}
                    className="font-pretendard-thin w-full text-center text-[0.5em] text-black/60"
                >
                    마일리지 내역이 없습니다
                </li>
            );
        }
    };

    return (
        <div className="flex h-full w-full flex-col pb-48 font-pretendard sm:pb-0">
            <ul className="mt-20 flex h-full w-full items-center justify-center">
                {MileageElement()}
            </ul>
        </div>
    );
};

export default MileageList;
