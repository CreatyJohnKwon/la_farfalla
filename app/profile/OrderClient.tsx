"use client";

import { useState } from "react";

const OrderClient = () => {
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
                    className="w-full text-center font-pretendard text-[0.5em] font-[600] text-black/60"
                >
                    주문 내역이 없습니다
                </li>
            );
        }
    };

    return (
        <div className="flex h-full w-full flex-col font-pretendard">
            {/* Header */}
            <div className="font-amstel-thin w-full">
                <span className="hidden h-auto w-full border-l border-gray-400 c_md:block" />
            </div>

            <ul className="mt-20 flex w-full items-center justify-center">
                {orderElement()}
            </ul>
        </div>
    );
};

export default OrderClient;
