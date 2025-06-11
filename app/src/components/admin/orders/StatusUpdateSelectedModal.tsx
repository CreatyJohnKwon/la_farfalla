import { OrderData, ShippingStatus } from "@/src/entities/type/interfaces";
import { useUpdateOrderMutation } from "@/src/shared/hooks/react-query/useOrderQuery";
import useOrderList from "@/src/shared/hooks/useOrderList";
import { motion } from "framer-motion";
import { useEffect } from "react";

const StatusUpdateSelectedModal = ({
    orderData,
    onClose,
}: {
    orderData: OrderData[] | null;
    onClose: () => void;
}) => {
    const {
        statusResult,

        waybillNumber,
        setWaybillNumber,
        radioValue,
        setRadioValue,
    } = useOrderList();

    const { mutateAsync: updateOrder } = useUpdateOrderMutation();

    // 더 간결한 버전 (ES6+ 사용) - TypeScript 버전
    const getMostFrequentShoppingStatusES6 = () => {
        // 배열 유효성 검사
        if (!orderData || !Array.isArray(orderData) || orderData.length === 0) {
            console.log("orderData is not a valid array:", orderData);
            return;
        }

        const statusCount = orderData.reduce(
            (acc: Record<ShippingStatus, number>, order) => {
                acc[order.shippingStatus] =
                    (acc[order.shippingStatus] || 0) + 1;
                return acc;
            },
            {
                pending: 0,
                ready: 0,
                shipped: 0,
                confirm: 0,
            },
        );

        const result = (Object.keys(statusCount) as ShippingStatus[]).reduce(
            (a, b) => (statusCount[a] > statusCount[b] ? a : b),
        );

        setRadioValue(result);
    };

    useEffect(() => {
        setWaybillNumber(0);

        if (orderData && Array.isArray(orderData) && orderData.length > 0) {
            getMostFrequentShoppingStatusES6();
        }
    }, [orderData]);

    const handleUpdate = async () => {
        if (
            (radioValue !== "pending" && waybillNumber.toString().length < 9) ||
            waybillNumber === null
        ) {
            return alert("운송장번호를 확인해주세요");
        }

        // if (confirm("운송 상태를 정말 변경하시겠습니까?")) {
        //     try {
        //         const result = await updateOrder({
        //             orderId: orderData?._id,
        //             shippingStatus: radioValue,
        //             trackingNumber: waybillNumber.toString(),
        //         });
        //         console.log("✅ 변경 결과:", result); // 결과 받아옴
        //         refetch();
        //         onClose();
        //     } catch (err) {
        //         console.error("❌ 변경 실패:", err);
        //         alert("변경 중 오류 발생!");
        //     }
        // }
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

                    {/* 운송장번호 입력 */}

                    {radioValue === "ready" && (
                        <div className="w-full flex-shrink-0 flex-col">
                            <label className="mb-2 block text-sm font-medium text-gray-600">
                                운송장번호 (우체국)
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
                        onClick={() => {
                            if (
                                (radioValue === "ready" &&
                                    waybillNumber.toString().length < 9) ||
                                waybillNumber === null
                            )
                                return alert("운송장번호를 확인해주세요");
                        }}
                        className="w-full rounded-lg bg-gray-800 py-2 hover:bg-gray-700"
                    >
                        변경
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

export default StatusUpdateSelectedModal;
