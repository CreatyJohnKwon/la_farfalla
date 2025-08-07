import { OrderData, ShippingStatus } from "@/src/entities/type/interfaces";
import { useSmartUpdateOrderMutation } from "@/src/shared/hooks/react-query/useOrderQuery";
import useOrderList from "@/src/shared/hooks/useOrderList";
import { motion } from "framer-motion";
import { useEffect } from "react";

const StatusUpdateModal = ({
    orderData,
    onClose,
}: {
    orderData: OrderData | null;
    onClose: () => void;
}) => {
    const {
        statusResult,
        waybillNumber,
        setWaybillNumber,
        radioValue,
        setRadioValue,
        refetch,
    } = useOrderList();

    const { mutateAsync: smartUpdateOrder } = useSmartUpdateOrderMutation();

    useEffect(() => {
        setRadioValue(orderData?.shippingStatus as ShippingStatus);
    }, []);

    const handleUpdate = async () => {
        if (
            (radioValue === "shipped" && waybillNumber.toString().length < 9) ||
            waybillNumber === null
        ) {
            return alert("운송장번호를 확인해주세요");
        }

        if (confirm("운송 상태를 정말 변경하시겠습니까?")) {
            try {
                await smartUpdateOrder({
                    orderId: orderData?._id,
                    shippingStatus: radioValue,
                    trackingNumber: waybillNumber.toString(),
                });
                refetch();
                onClose();
            } catch (err) {
                alert("변경 중 오류 발생!");
            }
        }
    };

    const handleCancelUpdate = async () => {
        if (confirm("정말로 배송을 취소하시겠습니까?")) {
            try {
                await smartUpdateOrder({
                    orderId: orderData?._id,
                    shippingStatus: "cancel",
                    trackingNumber: "",
                });
                refetch();
                onClose();
            } catch (err) {
                alert("변경 중 오류 발생!");
            }
        }
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
                    <div className="rounded-md bg-gray-50 p-6 shadow-sm transition">
                        {/* 라디오 버튼 그룹 */}
                        {Object.entries(statusResult).map(([key, label]) => {
                            if (key === "cancel") {
                                return (
                                    <div key={key} className="place-self-end">
                                        <button
                                            className="mt-4 text-red-600 hover:text-red-800"
                                            onClick={() => handleCancelUpdate()}
                                        >
                                            배송 취소하기
                                        </button>
                                    </div>
                                );
                            } else {
                                return (
                                    <label
                                        key={key}
                                        className="flex cursor-pointer items-center space-x-4 rounded-md p-3 transition hover:bg-gray-100"
                                    >
                                        <input
                                            type="radio"
                                            name="orderStatus"
                                            value={key}
                                            checked={radioValue === key}
                                            onChange={() =>
                                                setRadioValue(
                                                    key as ShippingStatus,
                                                )
                                            }
                                            className="accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                        />
                                        <span className="font-medium text-gray-800">
                                            {label}
                                        </span>
                                    </label>
                                );
                            }
                        })}
                    </div>

                    {radioValue === "shipped" && (
                        <div className="w-full flex-shrink-0 flex-col">
                            <label className="mb-2 block text-sm font-medium text-gray-600">
                                운송장번호 (우체국)
                            </label>
                            <input
                                type="text"
                                name="waybill"
                                placeholder={
                                    orderData?.trackingNumber
                                        ? "변경할 운송장번호 입력"
                                        : "운송장번호 입력"
                                }
                                className="w-full rounded-md border border-gray-300 p-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-300"
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

                    {radioValue === "confirm" && (
                        <div className="relative w-full flex-shrink-0 flex-col">
                            <label className="mb-2 block text-sm font-medium text-gray-600">
                                운송장번호 (우체국)
                            </label>
                            <h1
                                className={`"text-black"} w-full rounded-md border border-gray-300 p-2`}
                            >
                                {orderData?.trackingNumber
                                    ? orderData?.trackingNumber
                                    : "아직 출고 전입니다."}
                            </h1>
                        </div>
                    )}
                </div>

                {/* 닫기 버튼 */}
                <div className="mt-6 flex gap-3 text-lg text-white">
                    <button
                        onClick={() => handleUpdate()}
                        className="w-full rounded-md bg-gray-800 py-2 hover:bg-gray-700"
                    >
                        변경
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full rounded-md bg-slate-200 py-2 text-black hover:bg-slate-100"
                    >
                        닫기
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default StatusUpdateModal;
