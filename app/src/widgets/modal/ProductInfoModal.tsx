
import { OrderData, OrderItem } from "@src/components/order/interface";
import { motion } from "framer-motion";
import { useMemo } from "react";

const ProductInfoModal = ({
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
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative w-[90vw] max-w-md bg-white p-6 shadow-2xl sm:w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="mb-6 text-center font-pretendard text-2xl font-semibold text-gray-800">
                    상품 목록
                </h1>

                <div className="space-y-4 text-base text-gray-700">
                    <div className="rounded-md bg-gray-50 p-6">
                        <p className="mb-5 border-b pb-2 text-base font-semibold text-gray-700">
                            주문 상품 목록 (총 {totalQuantity}개)
                        </p>
                        <div className="space-y-4">
                            {orderData?.items.map((item: OrderItem, i) => (
                                <div
                                    key={i}
                                    className="flex flex-col gap-1 rounded-md border border-gray-200 bg-white px-4 py-3"
                                >
                                    <div className="text-sm font-medium text-gray-800">
                                        {item.productNm}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        색상: {item.color}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        수량: {item.quantity}개
                                    </div>
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
                    className="mt-6 w-full rounded-md bg-gray-800 py-2 text-lg text-white hover:bg-gray-700"
                >
                    닫기
                </button>
            </motion.div>
        </div>
    );
};

export default ProductInfoModal;
