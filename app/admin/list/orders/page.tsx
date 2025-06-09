"use client";

import UserInfoModal from "@/src/components/admin/orders/UserInfoModal";
import { OrderData } from "@/src/entities/type/interfaces";
import { useAllOrderQuery } from "@/src/shared/hooks/react-query/useOrderQuery";
import { useState } from "react";

const statusColor = {
    pending: "text-yellow-500",
    ready: "text-blue-500",
    shipped: "text-green-500",
    delivered: "text-indigo-500",
    cancelled: "text-gray-400",
} as const;

const statusResult = {
    pending: "출고",
    ready: "배송 준비",
    shipped: "배송",
    delivered: "배송 완료",
    cancelled: "배송 취소",
} as const;

const Orders = () => {
    const { data: orders, isLoading: orderListLoading } = useAllOrderQuery();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

    const onClose = () => setIsModalOpen(false);

    const toggleAll = () => {
        if (!orders) return;
        if (selectedOrderIds.length === orders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(
                orders.map((order) => order._id!).filter(Boolean),
            );
        }
    };

    const toggleSingle = (id: string | undefined) => {
        if (!id) return;

        if (selectedOrderIds.includes(id)) {
            setSelectedOrderIds((prev) =>
                prev.filter((orderId) => orderId !== id),
            );
        } else {
            setSelectedOrderIds((prev) => [...prev, id]);
        }
    };

    const isAllSelected = !!(
        orders?.length && selectedOrderIds.length === orders.length
    );

    return (
        <div className="w-full max-w-full overflow-x-auto border p-8 font-pretendard md:overflow-x-visible">
            <table className="ms-0 mt-20 h-full w-full min-w-[800px] table-auto text-left text-sm sm:ms-5 sm:mt-36">
                <thead>
                    <tr className="border-b text-gray-600">
                        <th className="w-[3%] px-2 py-2 md:px-4">
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={toggleAll}
                            />
                        </th>
                        <th className="w-[20%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            주문번호
                        </th>
                        <th className="w-[15%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            주문자
                        </th>
                        <th className="w-[15%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            상태
                        </th>
                        <th className="w-[15%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            총 결제금액
                        </th>
                        <th className="w-[20%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            주문일
                        </th>
                        <th className="w-[10%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            상태 변경
                        </th>
                    </tr>
                </thead>
                {!orderListLoading && (
                    <tbody>
                        {orders?.map((order: OrderData) => (
                            <tr
                                key={order._id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="px-2 py-2 md:px-4">
                                    {order._id && (
                                        <input
                                            type="checkbox"
                                            checked={Boolean(
                                                order._id &&
                                                    selectedOrderIds.includes(
                                                        order._id,
                                                    ),
                                            )}
                                            onChange={() =>
                                                toggleSingle(order._id)
                                            }
                                        />
                                    )}
                                </td>
                                {/* 주문 번호 */}
                                <td className="px-2 py-2 font-mono text-xs sm:text-sm md:px-4">
                                    <span className="block w-20 overflow-hidden truncate whitespace-nowrap sm:w-auto">
                                        {order._id}
                                    </span>
                                </td>
                                <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                    <button
                                        className="hover:text-blue-700 hover:underline"
                                        onClick={() => {
                                            setOrderData(order);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        {order.userNm}
                                    </button>
                                </td>
                                <td
                                    className={`px-2 py-2 text-xs font-semibold sm:text-sm md:px-4 ${statusColor[order.shippingStatus]}`}
                                >
                                    {statusResult[order.shippingStatus]} 중
                                </td>
                                <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                    {order.totalPrice.toLocaleString()}원
                                </td>
                                <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                    {order.createdAt}
                                </td>
                                <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                    <button className="text-red-500">
                                        수정
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                )}
            </table>
            {isModalOpen && orderData && (
                <UserInfoModal orderData={orderData} onClose={onClose} />
            )}
        </div>
    );
};

export default Orders;
