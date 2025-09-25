"use client";

import { refundPayment } from '@/src/shared/lib/server/order';
import { OrderData } from '@src/components/order/interface';
import { X } from "lucide-react";
import { useEffect, useState } from "react";

// 🆕 취소/교환및반품 요청 모달 컴포넌트 (기존 디자인 스타일 유지)
const CancelOrderModal = ({
    isOpen,
    onClose,
    onSubmit,
    order,
    type,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        type: string;
        reason: string;
        orderInfo: string;
    }) => Promise<void>;
    order: OrderData;
    type: "cancel" | "exchange" | "return";
}) => {
    const [requestType, setRequestType] = useState<"cancel" | "exchange" | "return">(type);
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setRequestType(type);
    }, [type]);

    const actionText = (): string => {
        switch (requestType) {
            case "cancel":
                return "주문 취소";
            case "exchange":
                return "교환";
            case "return":
                return "반품";
            default:
                return "";
        }
    }

    const handleSubmit = async () => {
        if (!reason.trim()) {
            alert("사유를 입력해주세요.");
            return;
        }

        const orderInfo = `
            주문번호: ${order._id}
            주문자명: ${order.userNm}
            주문상품: ${order.items.map((item) => `${item.productNm} (${item.size}/${item.color})`).join(", ")}
            주문금액: ${formatPrice(order.totalPrice)}
            주문일시: ${formatDate(order.createdAt)}
        `.trim();

        if (
            confirm(
                `정말로 ${actionText()}를 요청하시겠습니까?\n\n처리까지 2-3일 소요될 수 있습니다.`,
            )
        ) {
            setIsSubmitting(true);
            try {
                onSubmit({
                    type: requestType,
                    reason: reason.trim(),
                    orderInfo,
                });
                if (type === "cancel") {
                    const refundData = {
                        paymentId: order.paymentId,
                        reason
                    }

                    const result = await refundPayment(refundData)
                    console.warn("refund success");
                    result.message ? alert(result.message) : null;
                }
            } catch (error: any) {
                console.error(error.message)
                if (error.message === "payment already cancelled") alert("이미 환불이 완료되었습니다.\n타 문의는 Q&A 채널로 문의해주세요.")
                else alert("환불이 실패되었습니다.\nQ&A 채널로 문의해주세요.\n" + error.message)
            } finally {
                onClose();
                setReason("");
                setIsSubmitting(false);
            }
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("ko-KR").format(price) + " KRW";
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={onClose}
            style={{ touchAction: "manipulation" }}
        >
            <div
                className="w-full max-w-md rounded-lg bg-white"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <h3 className="font-pretendard text-lg font-bold text-gray-900">
                        {actionText()} 요청
                    </h3>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gray-100 active:bg-gray-200"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                <div className="space-y-4 p-4">
                    {/* 요청 타입 선택 */}
                    {requestType !== "cancel" ? (
                        <div>
                            <label className="mb-2 block font-pretendard text-sm font-medium text-gray-700">
                                요청 유형
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="requestType"
                                        value="exchange"
                                        checked={requestType === "exchange"}
                                        onChange={(e) =>
                                            setRequestType(
                                                e.target.value as "exchange",
                                            )
                                        }
                                        className="mr-2"
                                    />
                                    <span className="font-pretendard text-sm text-gray-700">
                                        교환 요청
                                    </span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="requestType"
                                        value="return"
                                        checked={requestType === "return"}
                                        onChange={(e) =>
                                            setRequestType(
                                                e.target.value as "return",
                                            )
                                        }
                                        className="mr-2"
                                    />
                                    <span className="font-pretendard text-sm text-gray-700">
                                        반품 요청
                                    </span>
                                </label>
                            </div>
                        </div>
                    ) : <></>}

                    {/* 사유 입력 */}
                    <div>
                        <label className="mb-2 block font-pretendard text-sm font-medium text-gray-700">
                            {actionText()} 사유
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full resize-none border border-gray-300 bg-white p-3 text-sm focus:border-black focus:outline-none"
                            rows={4}
                            placeholder={requestType === "exchange" ? "교환 요청 시, 교환을 원하시는 상품을 명확히 기재해주시기 바랍니다.\n예시) 사이즈: m, 색상: navy" : `${actionText()} 사유를 상세히 작성해주세요.`}
                            maxLength={500}
                        />
                        <div className="mt-1 flex justify-between">
                            <p className="font-pretendard text-xs text-gray-500">
                                상세하게 작성해주시면 더 빠른 처리가
                                가능합니다.
                            </p>
                            <span className="font-pretendard text-xs text-gray-400">
                                {reason.length}/500
                            </span>
                        </div>
                    </div>

                    {/* 주의사항 */}
                    <div className="rounded-sm border border-yellow-200 bg-yellow-50 p-3">
                        <div className="text-sm text-yellow-800">
                            <p className="mb-1 font-pretendard font-medium">
                                처리 안내
                            </p>
                            <ul className="space-y-1 font-pretendard text-xs">
                                <li>• 요청 접수 후 3일~7일 내 처리됩니다</li>
                                {requestType === "return" && <li>• 반품 완료 시, 환불은 원래 결제수단으로 처리됩니다</li>}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 푸터 */}
                <div className="flex space-x-3 border-t border-gray-200 px-4 py-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-100 px-6 py-2.5 font-pretendard text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!reason.trim() || isSubmitting}
                        className="flex-1 bg-black px-6 py-2.5 font-pretendard text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                    >
                        {isSubmitting ? "처리 중" : "요청 제출"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelOrderModal;
