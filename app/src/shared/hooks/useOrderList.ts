import { OrderData } from "@/src/entities/type/interfaces";
import { useAllOrderQuery } from "@/src/shared/hooks/react-query/useOrderQuery";
import { useState } from "react";

const useOrderList = () => {
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

    const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
    const [isSelectedModalOpen, setIsSelectedModalOpen] =
        useState<boolean>(false);

    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<OrderData[]>([]);

    const {
        data: orders,
        isLoading: orderListLoading,
        refetch,
    } = useAllOrderQuery();

    const onCloseUserModal = () => setIsUserModalOpen(false);
    const onCloseStatusModal = () => setIsStatusModalOpen(false);
    const onCloseSelectedModal = () => setIsSelectedModalOpen(false);

    const toggleAll = () => {
        if (!orders) return;
        if (selectedOrder.length === orders.length) {
            setSelectedOrder([]);
        } else {
            setSelectedOrder(orders);
        }
    };

    const toggleSingle = (data: OrderData | undefined) => {
        if (!data) return;

        if (selectedOrder.includes(data)) {
            setSelectedOrder((prev) =>
                prev.filter((orderId) => orderId !== data),
            );
        } else {
            setSelectedOrder((prev) => [...prev, data]);
        }
    };

    const isAllSelected = !!(
        orders?.length && selectedOrder.length === orders.length
    );

    const updateStatus = () => {};

    return {
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
    };
};

export default useOrderList;
