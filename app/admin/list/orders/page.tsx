"use client";

import StatusUpdateSelectedModal from "@/src/components/admin/orders/StatusUpdateSelectedModal";
import StatusUpdateModal from "@/src/components/admin/orders/StatusUpdateModal";
import UserInfoModal from "@/src/components/admin/orders/UserInfoModal";
import { OrderData } from "@/src/entities/type/interfaces";
import useOrderList from "@/src/shared/hooks/useOrderList";

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
        orderData,
        setOrderData,
        selectedOrder,

        orderListLoading,
        orders,

        onCloseUserModal,
        onCloseStatusModal,
        onCloseSelectedModal,

        toggleAll,
        toggleSingle,
        isAllSelected,
        updateStatus,

        refetch,
    } = useOrderList();

    // 두번 호출 해결해야 됨 (트래픽 2배 증가 방어목적)
    // useEffect(() => {
    //     console.log("asd");
    //     refetch();
    // }, []);

    return (
        <div className="w-full max-w-full overflow-x-auto border font-pretendard sm:p-16 md:overflow-x-visible">
            <div className="ms-5 mt-20 flex h-8 w-full items-center justify-between sm:ms-0">
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
                    title="선택적 상태 수정"
                    disabled={selectedOrder.length === 0}
                >
                    선택적 상태 변경
                </button>
            </div>
            <table className="ms-5 mt-5 h-full w-full min-w-[700px] table-auto text-left text-sm sm:ms-0">
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
                                                    selectedOrder.includes(
                                                        order,
                                                    ),
                                            )}
                                            onChange={() => toggleSingle(order)}
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
                                            setIsUserModalOpen(true);
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
                <UserInfoModal
                    orderData={orderData}
                    onClose={onCloseUserModal}
                />
            )}
            {isStatusModalOpen && orderData && (
                <StatusUpdateModal
                    orderData={orderData}
                    onClose={onCloseStatusModal}
                />
            )}
            {isSelectedModalOpen && (
                <StatusUpdateSelectedModal
                    orderData={selectedOrder}
                    onClose={onCloseSelectedModal}
                />
            )}
        </div>
    );
};

export default Orders;
