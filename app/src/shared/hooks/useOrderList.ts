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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

    const {
        data: orders,
        isLoading: orderListLoading,
        refetch,
    } = useAllOrderQuery();

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

    const updateStatus = () => {
        if (selectedOrderIds.length === 0)
            return alert("1개 이상 체크해주세요.");

        // 여기에 상품 출고 => 배송 상태 변경 모달 추가
    };

    return {
        statusColor,
        statusResult,

        isModalOpen,
        setIsModalOpen,
        orderData,
        setOrderData,
        selectedOrderIds,

        orderListLoading,
        orders,

        onClose,
        toggleAll,
        toggleSingle,
        isAllSelected,
        updateStatus,

        refetch,
    };
};

export default useOrderList;
