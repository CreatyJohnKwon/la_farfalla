import { OrderData, ShippingStatus } from "@src/components/order/interface";
import { useAllOrderQuery } from "@src/shared/hooks/react-query/useOrderQuery";
import { useState } from "react";

const useOrderList = () => {
    const statusColor = {
        pending: "text-yellow-500",
        ready: "text-blue-500",
        shipped: "text-indigo-500",
        confirm: "text-green-500",
        cancel: "text-red-500",
        return: "text-red-500",
        exchange: "text-red-500",
    } as const;

    const statusResult = {
        pending: "주문 완료",
        ready: "상품 준비 중",
        shipped: "출고",
        confirm: "구매 확정",
        cancel: "주문 취소",
        return: "반품",
        exchange: "교환"
    } as const;

    const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState<boolean>(false);
    const [isSelectedModalOpen, setIsSelectedModalOpen] =
        useState<boolean>(false);
    const [isProductModalOpen, setIsProductModalOpen] =
        useState<boolean>(false);

    const [orderData, setOrderData] = useState<OrderData | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<OrderData[]>([]);
    const [waybillNumber, setWaybillNumber] = useState<number>(0);

    const [radioValue, setRadioValue] = useState<ShippingStatus>("pending");

    const {
        data: orders,
        isLoading: orderListLoading,
        refetch,
    } = useAllOrderQuery();

    const onClose = () => {
        // 모달 종료 상태 변경
        setIsUserModalOpen(false);
        setIsProductModalOpen(false);
        setIsStatusModalOpen(false);
        setIsSelectedModalOpen(false);

        setSelectedOrder([]);
    };

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

    return {
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
        waybillNumber,
        setWaybillNumber,
        selectedOrder,
        setSelectedOrder,
        radioValue,
        setRadioValue,

        orderListLoading,
        orders,

        onClose,

        toggleAll,
        toggleSingle,
        isAllSelected,

        refetch,
    };
};

export default useOrderList;
