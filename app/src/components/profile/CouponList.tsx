"use client";

import { useState } from "react";

const CouponList = () => {
    const [orderDatas, setOrderDatas] = useState<string[] | []>([]);

    const orderElement = () => {
        if (orderDatas.length > 0) {
            orderDatas.map((item: any, index: number) => {
                return <li key={`order_item_${index}`}>{item}</li>;
            });
        } else {
            return (
                <li
                    key={`order_item_none`}
                    className="font-pretendard-thin w-full text-center text-[0.5em] text-black/60"
                >
                    발급된 쿠폰이 없습니다
                </li>
            );
        }
    };

    return (
        <div className="flex h-full w-full flex-col pb-48 font-pretendard sm:pb-0">
            <ul className="mt-20 flex h-full w-full items-center justify-center">
                {orderElement()}
            </ul>
        </div>
    );
};

export default CouponList;
