import { OrderData, ShippingStatus } from "@/src/entities/type/interfaces";
import { useOrderQuery } from "@/src/shared/hooks/react-query/useBenefitQuery";
import useOrderList from "@/src/shared/hooks/useOrderList";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const StatusUpdateModal = ({
    orderData,
    onClose,
}: {
    orderData: OrderData | null;
    onClose: () => void;
}) => {
    const { refetch } = useOrderQuery();

    const { statusResult } = useOrderList();
    const [radioValue, setRadioValue] = useState<
        "pending" | "ready" | "shipped" | "delivered" | "cancelled"
    >(orderData?.shippingStatus as ShippingStatus | "pending");
    const [waybillNumber, setWaybillNumber] = useState<number>(
        Number(orderData?.trackingNumber),
    );

    const updatePendingStatus = () => {
        alert("상태가 업데이트 되었습니다.");
        onClose();
        refetch();
    };

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
                {/* 헤더 */}
                <h1 className="mb-8 text-center font-sans text-3xl font-semibold text-gray-900">
                    주문 상태 변경
                </h1>

                {/* 내용 영역 */}
                <div className="space-y-6 text-gray-700">
                    <div className="rounded-lg bg-gray-50 p-6 shadow-sm transition">
                        {/* 라디오 버튼 그룹 */}
                        {Object.entries(statusResult).map(([key, label]) => (
                            <label
                                key={key}
                                className="flex cursor-pointer items-center space-x-4 rounded-lg p-3 transition hover:bg-gray-100"
                            >
                                <input
                                    type="radio"
                                    name="orderStatus"
                                    value={key}
                                    checked={radioValue === key}
                                    onChange={() =>
                                        setRadioValue(key as ShippingStatus)
                                    }
                                    className="accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                                <span className="font-medium text-gray-800">
                                    {label}
                                </span>
                            </label>
                        ))}
                    </div>

                    {radioValue !== "pending" && (
                        <div className="w-full flex-shrink-0 flex-col">
                            <label className="mb-2 block text-sm font-medium text-gray-600">
                                운송장번호
                            </label>
                            <input
                                type="text"
                                name="waybill"
                                placeholder="운송장번호 입력 (숫자만 입력하세요)"
                                className="w-full rounded-lg border border-gray-300 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-300"
                                value={waybillNumber ? waybillNumber : ""}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        // 숫자만 허용하는 정규식
                                        setWaybillNumber(Number(value));
                                    } else {
                                        return;
                                    }
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* 닫기 버튼 */}
                <div className="mt-6 flex gap-3 text-lg text-white">
                    <button
                        onClick={updatePendingStatus}
                        className="w-full rounded-lg bg-gray-800 py-2 hover:bg-gray-700"
                    >
                        적용
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full rounded-lg bg-slate-200 py-2 text-black hover:bg-slate-100"
                    >
                        닫기
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default StatusUpdateModal;
