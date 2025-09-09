"use client";

import { useUserQuery } from "@src/shared/hooks/react-query/useUserQuery";
import SkeletonList from "./SkeletonList";
import OrderItem from "./OrderItem";
import { useOrderQuery } from "@/src/shared/hooks/react-query/useOrderQuery";

const OrderList = () => {
    const { data: user, isLoading: isUserLoading } = useUserQuery();
    const {
        data: order,
        isLoading: isOrderListLoading,
        isError,
    } = useOrderQuery(user?._id);

    if (isUserLoading || isOrderListLoading) {
        return (
            <ul className="flex w-[85vw] flex-col gap-4 overflow-y-auto pb-5 sm:w-auto">
                <SkeletonList />
            </ul>
        );
    }

    if (isError) {
        return (
            <ul className="flex w-[90vw] flex-col gap-4 sm:w-auto">
                <li className="text-center text-red-500">
                    주문 내역 로딩 실패. 잠시 후 다시 시도해주세요.
                </li>
            </ul>
        );
    }

    if (order && order.length > 0) {
        return (
            <ul className="flex w-[85vw] flex-col gap-4 overflow-y-auto pb-5 sm:w-auto">
                {order.map((item, index) => (
                    <OrderItem key={`order_${index}`} item={item} />
                ))}
            </ul>
        );
    }

    return (
        <ul className="flex w-[90vw] flex-col gap-4 sm:w-auto">
            <li className="font-pretendard-thin mt-20 w-full text-center text-[0.5em] text-black/60">
                주문 내역이 없습니다
            </li>
        </ul>
    );
};

export default OrderList;
