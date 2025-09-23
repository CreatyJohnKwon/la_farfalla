import { OrderData, ShippingStatus } from "@src/components/order/interface";
import { useAllOrderQuery } from "@src/shared/hooks/react-query/useOrderQuery";
import { useMemo, useState } from "react";

const useOrderList = () => {
    const statusColor = {
        pending: "text-yellow-500",
        ready: "text-blue-500",
        shipped: "text-indigo-500",
        confirm: "text-green-500",
        cancel: "text-red-500",
        return: "text-red-500",
        exchange: "text-red-500",
        prepare: "text-yellow-500",
    } as const;

    const statusResult = {
        pending: "주문 완료",
        ready: "상품 준비 중",
        shipped: "출고",
        confirm: "구매 확정",
        cancel: "주문 취소",
        return: "반품",
        exchange: "교환",
        prepare: "결제 오류"
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
        data,
        isLoading: orderListLoading,
        refetch,
        fetchNextPage,   // 다음 페이지를 불러오는 함수
        hasNextPage,     // 다음 페이지가 있는지 여부
        isFetchingNextPage, // 다음 페이지 로딩 상태
    } = useAllOrderQuery();

    const orders = useMemo(() => {
        if (!data) return [];

        return data.pages.flatMap((page: any) => page.orders) ?? [];
    }, [data]);

    const onClose = () => {
        setIsUserModalOpen(false);
        setIsProductModalOpen(false);
        setIsStatusModalOpen(false);
        setIsSelectedModalOpen(false);
        setSelectedOrder([]);
    };

    const toggleAll = () => {
        // 현재 불러온 모든 데이터를 기준으로 선택/해제
        if (selectedOrder.length === orders.length) {
            setSelectedOrder([]);
        } else {
            setSelectedOrder([...orders]); // 불변성을 위해 새로운 배열 생성
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
        orders.length > 0 && selectedOrder.length === orders.length
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
        hasNextPage,
        isFetchingNextPage,

        onClose,

        fetchNextPage,
        toggleAll,
        toggleSingle,
        isAllSelected,

        refetch,
    };
};

export default useOrderList;
