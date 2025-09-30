import { OrderData, OrderItem } from "@src/components/order/interface";
import { useMemo } from "react";
import ModalWrap from "../etc/ModalWrap";

const OrderedProductModal = ({
    orderData,
    onClose,
}: {
    orderData: OrderData | null;
    onClose: () => void;
}) => {
    const totalQuantity = useMemo(() => {
        return (
            orderData?.items.reduce((acc, cur) => acc + cur.quantity, 0) || 0
        );
    }, [orderData?.items]);

    return (
        <ModalWrap
            onClose={onClose}
            className="relative w-[90vw] max-w-md bg-white p-6 shadow-2xl sm:w-full"
        >
            <h1 className="mb-6 text-center font-pretendard text-2xl font-semibold text-gray-800">
                상품 목록
            </h1>

            <div className="space-y-4 text-base text-gray-700">
                <div className="rounded-sm bg-gray-50 p-6">
                    <p className="mb-5 border-b pb-2 text-base font-semibold text-gray-700">
                        주문 상품 목록 (총 {totalQuantity}개 / {orderData?.totalPrice.toLocaleString()}원)
                    </p>
                    <div className="space-y-4">
                        {orderData?.items.map((item: OrderItem, i) => (
                            <div
                                key={i}
                                className="relative flex flex-row gap-1 rounded-sm border border-gray-200 bg-white px-4 py-3"
                            >
                                <div className="flex flex-col gap-1">
                                    <span className="text-base font-pretendard font-[600] text-gray-800">
                                        {item.productNm}
                                    </span>
                                    {item.additional ? 
                                        <>
                                            <span className="text-sm text-gray-500">
                                                추가 상품: {item.additional}
                                            </span>
                                        </>
                                        :
                                        <>
                                            <span className="text-sm text-gray-500">
                                                색상: {item.color}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                사이즈: {item.size}
                                            </span>
                                        </>
                                    }
                                    <span className="text-sm text-gray-500">
                                        수량: {item.quantity}개
                                    </span>
                                </div>
                                <span className="text-sm text-gray-500 absolute right-4">
                                    {item.price ? item.price : "-"} 원
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="me-1 mt-2 place-self-end text-end text-xs">
                    <p className="mb-1 font-medium text-gray-500">
                        상품 UUID (DB 확인용)
                    </p>
                    <p className="font-mono text-gray-600">
                        {orderData?._id}
                    </p>
                </div>
            </div>

            <button
                onClick={onClose}
                className="mt-6 w-full rounded-sm bg-gray-800 py-2 text-lg text-white hover:bg-gray-700"
            >
                닫기
            </button>
        </ModalWrap>
    );
};

export default OrderedProductModal;