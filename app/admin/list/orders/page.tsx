"use client";

import { useState, useCallback } from "react";
import StatusUpdateSelectedModal from "@/src/widgets/modal/StatusUpdateSelectedModal";
import StatusUpdateModal from "@/src/widgets/modal/StatusUpdateModal";
import UserInfoModal from "@/src/widgets/modal/UserInfoModal";
import { OrderData } from "@/src/entities/type/interfaces";
import useOrderList from "@/src/shared/hooks/useOrderList";
import ProductInfoModal from "@/src/widgets/modal/ProductInfoModal";

const Orders = () => {
    const {
        statusColor,
        statusResult,

        isUserModalOpen,
        setIsUserModalOpen,
        isStatusModalOpen,
        setIsStatusModalOpen,
        isSelectedModalOpen,
        setIsSelectedModalOpen,
        isProductModalOpen,
        setIsProductModalOpen,
        orderData,
        setOrderData,
        selectedOrder,

        orderListLoading,
        orders,

        onClose,

        toggleAll,
        toggleSingle,
        isAllSelected,

        refetch,
    } = useOrderList();

    // Shift 키 범위 선택을 위한 상태
    const [lastCheckedIndex, setLastCheckedIndex] = useState<number | null>(
        null,
    );

    // 개별 체크박스 클릭 처리 (Shift 키 범위 선택 포함)
    const handleToggleSingle = useCallback(
        (
            order: OrderData,
            currentIndex: number,
            event: React.MouseEvent<HTMLInputElement>,
        ) => {
            const isShiftPressed = event.shiftKey;

            if (isShiftPressed && lastCheckedIndex !== null && orders) {
                // Shift 키가 눌린 상태에서 범위 선택
                const startIndex = Math.min(lastCheckedIndex, currentIndex);
                const endIndex = Math.max(lastCheckedIndex, currentIndex);

                // 현재 클릭한 주문의 선택 상태를 기준으로 결정
                const isCurrentSelected = selectedOrder.some(
                    (selected) => selected._id === order._id,
                );
                const shouldSelect = !isCurrentSelected;

                // 범위 내의 모든 주문을 선택/해제 (현재 클릭한 항목 포함)
                for (let i = startIndex; i <= endIndex; i++) {
                    const targetOrder = orders[i];
                    if (targetOrder) {
                        const isTargetSelected = selectedOrder.some(
                            (selected) => selected._id === targetOrder._id,
                        );

                        // 목표 상태와 현재 상태가 다르면 토글
                        if (shouldSelect !== isTargetSelected) {
                            setTimeout(() => toggleSingle(targetOrder), 0);
                        }
                    }
                }
            } else {
                // 일반 클릭 - 단일 토글
                toggleSingle(order);
                setLastCheckedIndex(currentIndex);
            }
        },
        [lastCheckedIndex, orders, selectedOrder, toggleSingle],
    );

    // 전체 선택 시 lastCheckedIndex 초기화
    const handleToggleAll = useCallback(() => {
        toggleAll();
        setLastCheckedIndex(null);
    }, [toggleAll]);

    return (
        <div className="w-full max-w-full overflow-x-auto font-pretendard sm:p-16 md:overflow-x-visible">
            <div className="ms-5 mt-20 flex h-8 w-full items-center gap-6 sm:ms-0 sm:justify-between">
                {/* 새로고침 버튼 */}
                <button
                    onClick={() => refetch()}
                    className="flex h-full w-8 items-center justify-center rounded border border-gray-300 bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
                    title="새로고침"
                >
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                </button>

                <button
                    onClick={() => {
                        setIsSelectedModalOpen(true);
                    }}
                    className={`flex h-full w-auto items-center justify-center rounded border border-gray-300 bg-gray-100 p-2 text-gray-600 transition-colors ${selectedOrder.length > 0 && "hover:bg-gray-200 hover:text-gray-800"}`}
                    title="일괄 변경"
                    disabled={selectedOrder.length === 0}
                >
                    일괄 변경 ({selectedOrder.length})
                </button>
            </div>

            <table className="ms-5 mt-5 h-full w-full min-w-[700px] table-auto text-left text-sm sm:ms-0">
                <thead>
                    <tr className="border-b text-gray-600">
                        <th className="w-[5%] px-2 py-2 md:px-4">
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={handleToggleAll}
                            />
                        </th>
                        <th className="w-[10%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            주문번호
                        </th>
                        <th className="w-[10%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            주문자
                        </th>
                        <th className="w-[12%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            휴대전화번호
                        </th>
                        <th className="w-[20%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            주소
                        </th>
                        <th className="w-[10%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            상품목록
                        </th>
                        <th className="w-[10%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            상태
                        </th>
                        <th className="w-[8%] px-2 py-2 text-xs sm:text-sm md:px-4">
                            상태 변경
                        </th>
                    </tr>
                </thead>
                {!orderListLoading && orders && (
                    <tbody>
                        {orders?.map((order: OrderData, index) => (
                            <tr
                                key={order._id}
                                className={`border-b hover:bg-gray-50 ${
                                    lastCheckedIndex === index
                                        ? "bg-blue-50 ring-1 ring-blue-200"
                                        : ""
                                }`}
                            >
                                {/* 체크 박스 */}
                                <td className="px-2 py-2 md:px-4">
                                    {order._id && (
                                        <input
                                            type="checkbox"
                                            checked={selectedOrder.some(
                                                (selected) =>
                                                    selected._id === order._id,
                                            )}
                                            onClick={(e) => {
                                                handleToggleSingle(
                                                    order,
                                                    index,
                                                    e,
                                                );
                                            }}
                                            onChange={() => {}} // 빈 함수로 onChange 경고 방지
                                        />
                                    )}
                                </td>
                                {/* 주문자 번호 */}
                                <td className="px-2 py-2 font-mono text-xs sm:text-sm md:px-4">
                                    {order._id}
                                </td>
                                {/* 주문자 명 */}
                                <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                    <button
                                        className="hover:text-blue-700 hover:underline"
                                        onClick={() => {
                                            setOrderData(order);
                                            setIsUserModalOpen(true);
                                        }}
                                    >
                                        {order.userNm}
                                        {lastCheckedIndex === index && (
                                            <span className="ml-1 text-xs text-blue-500">
                                                {`\t●`}
                                            </span>
                                        )}
                                    </button>
                                </td>
                                {/* 주문자 번호 */}
                                <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                    {order.phoneNumber}
                                </td>
                                {/* 주문자 주소 */}
                                <td className="px-2 py-2 font-pretendard text-xs sm:text-sm md:px-4">
                                    <span className="block w-20 overflow-hidden truncate whitespace-nowrap sm:w-auto">
                                        {`${order.address} ${order.detailAddress && `, ${order.detailAddress}`} ${order.postcode && `(${order.postcode})`}`}
                                    </span>
                                </td>
                                {/* 총 갯수 */}
                                <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                    <button
                                        className="hover:text-blue-700 hover:underline"
                                        onClick={() => {
                                            setOrderData(order);
                                            setIsProductModalOpen(true);
                                        }}
                                    >
                                        {`총 ${order?.items.reduce((acc, cur) => acc + cur.quantity, 0) || 0}개`}
                                    </button>
                                </td>
                                <td
                                    className={`px-2 py-2 text-xs font-semibold sm:text-sm md:px-4 ${statusColor[order.shippingStatus]}`}
                                >
                                    {statusResult[order.shippingStatus]}
                                </td>
                                <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                    <button
                                        className="text-red-500"
                                        onClick={() => {
                                            setOrderData(order);
                                            setIsStatusModalOpen(true);
                                        }}
                                    >
                                        변경
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                )}
            </table>
            {isUserModalOpen && orderData && (
                <UserInfoModal orderData={orderData} onClose={onClose} />
            )}
            {isProductModalOpen && orderData && (
                <ProductInfoModal orderData={orderData} onClose={onClose} />
            )}
            {isStatusModalOpen && orderData && (
                <StatusUpdateModal orderData={orderData} onClose={onClose} />
            )}
            {isSelectedModalOpen && (
                <StatusUpdateSelectedModal
                    orderData={selectedOrder}
                    onClose={onClose}
                />
            )}
        </div>
    );
};

export default Orders;
