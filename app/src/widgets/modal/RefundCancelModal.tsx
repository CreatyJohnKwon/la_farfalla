import { OrderData } from "@/src/entities/type/interfaces";
import { X } from "lucide-react";
import { useState } from "react";

// 🆕 4가지 주문 취소 알고리즘 적용된 환불/취소 요청 모달
const RefundCancelModal = ({
    isOpen,
    onClose,
    onSubmit,
    order,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        type: string;
        reason: string;
        orderInfo: string;
    }) => void;
    order: OrderData;
}) => {
    // 🆕 주문 상태에 따른 기본 타입 설정
    const getDefaultRequestType = () => {
        switch (order.shippingStatus) {
            case "pending":
            case "ready":
                return "cancel"; // 주문 취소
            case "shipped":
                return "refund"; // 환불
            case "confirm":
                return "exchange"; // 교환
            default:
                return "cancel";
        }
    };

    // 🆕 주문 상태에 따른 가능한 옵션들
    const getAvailableOptions = () => {
        switch (order.shippingStatus) {
            case "pending":
            case "ready":
                return [
                    {
                        value: "cancel",
                        label: "주문 취소",
                        description: "주문을 완전히 취소합니다",
                    },
                ];
            case "shipped":
                return [
                    {
                        value: "refund",
                        label: "환불 요청",
                        description: "상품 반송 후 환불받습니다",
                    },
                    {
                        value: "exchange",
                        label: "교환 요청",
                        description: "다른 상품으로 교환합니다",
                    },
                ];
            case "confirm":
                return [
                    {
                        value: "exchange",
                        label: "교환 요청",
                        description: "동일 가격대 상품으로만 교환 가능합니다",
                    },
                ];
            default:
                return [
                    {
                        value: "cancel",
                        label: "주문 취소",
                        description: "주문을 취소합니다",
                    },
                ];
        }
    };

    const [requestType, setRequestType] = useState(getDefaultRequestType());
    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const availableOptions = getAvailableOptions();

    // 🆕 상태별 제목 설정
    const getModalTitle = () => {
        switch (order.shippingStatus) {
            case "pending":
            case "ready":
                return "주문 취소";
            case "shipped":
                return "환불 및 교환";
            case "confirm":
                return "교환 요청";
            default:
                return "주문 처리";
        }
    };

    // 🆕 요청 타입별 안내 메시지
    const getTypeDescription = (type: string) => {
        switch (type) {
            case "cancel":
                return {
                    title: "주문 취소",
                    description:
                        "아직 상품 준비 전이므로 즉시 취소 가능합니다.",
                    processingTime: "즉시 처리",
                };
            case "refund":
                return {
                    title: "환불 요청",
                    description: "상품을 반송하신 후 환불 처리됩니다.",
                    processingTime: "반송 확인 후 3-5일",
                };
            case "exchange":
                return {
                    title: "교환 요청",
                    description:
                        order.shippingStatus === "confirm"
                            ? "구매확정 후에는 동일 가격대 상품으로만 교환 가능합니다."
                            : "다른 상품으로 교환하거나 사이즈/색상을 변경합니다.",
                    processingTime:
                        order.shippingStatus === "confirm"
                            ? "상품 접수 후 10-14일"
                            : "상품 접수 후 7-10일",
                };
            default:
                return {
                    title: "요청 처리",
                    description: "요청사항을 접수하여 처리합니다.",
                    processingTime: "2-3일",
                };
        }
    };

    // 🆕 요청 타입별 사유 가이드
    const getReasonPlaceholder = (type: string) => {
        switch (type) {
            case "cancel":
                return "주문 취소 사유를 입력해주세요.\n예: 실수로 주문, 다른 상품 주문 예정 등";
            case "refund":
                return "환불 사유를 상세히 입력해주세요.\n예: 상품이 설명과 다름, 사이즈가 맞지 않음 등";
            case "exchange":
                return order.shippingStatus === "confirm"
                    ? "교환 사유 및 원하는 상품 정보를 입력해주세요.\n※ 구매확정 후에는 동일 가격대 상품으로만 교환 가능\n예: 사이즈 변경 (L → XL), 색상 변경 (블랙 → 화이트), 같은 가격의 다른 상품 등"
                    : "교환 사유 및 원하는 상품 정보를 입력해주세요.\n예: 사이즈 변경 (L → XL), 색상 변경 (블랙 → 화이트) 등";
            default:
                return "사유를 입력해주세요.";
        }
    };

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
배송상태: ${getShippingStatusText(order.shippingStatus)}
        `.trim();

        const typeInfo = getTypeDescription(requestType);

        if (
            confirm(
                `정말로 ${typeInfo.title}를 요청하시겠습니까?\n\n처리시간: ${typeInfo.processingTime}\n${typeInfo.description}`,
            )
        ) {
            setIsSubmitting(true);
            try {
                await onSubmit({
                    type: requestType,
                    reason: reason.trim(),
                    orderInfo,
                });
                onClose();
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // 🆕 배송 상태 텍스트 변환
    const getShippingStatusText = (status: string) => {
        switch (status) {
            case "pending":
                return "주문완료";
            case "ready":
                return "상품준비중";
            case "shipped":
                return "출고완료";
            case "confirm":
                return "구매확정";
            case "cancel":
                return "취소됨";
            default:
                return status;
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

    const currentTypeInfo = getTypeDescription(requestType);

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
                        {getModalTitle()}
                    </h3>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gray-100 active:bg-gray-200"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                <div className="space-y-4 p-4">
                    <div>
                        <label className="block font-pretendard text-sm font-medium text-gray-700">
                            요청 유형
                        </label>
                        <div>
                            {availableOptions.map((option) => (
                                <label
                                    key={option.value}
                                    className="flex items-center"
                                >
                                    <input
                                        type="radio"
                                        name="requestType"
                                        value={option.value}
                                        checked={requestType === option.value}
                                        onChange={(e) =>
                                            setRequestType(
                                                e.target.value as any,
                                            )
                                        }
                                        className="mr-3 mt-2"
                                    />
                                    <div>
                                        <span className="font-pretendard text-sm font-medium text-gray-900">
                                            {option.label}
                                        </span>
                                        <p className="font-pretendard text-xs text-gray-600">
                                            {option.description}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 🆕 선택된 타입 정보 표시 */}
                    <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                        <div className="text-sm text-blue-800">
                            <p className="mb-1 font-pretendard font-medium">
                                {currentTypeInfo.title} 안내
                            </p>
                            <p className="mb-2 font-pretendard text-xs">
                                {currentTypeInfo.description}
                            </p>
                            <p className="font-pretendard text-xs font-medium">
                                예상 처리시간: {currentTypeInfo.processingTime}
                            </p>
                        </div>
                    </div>

                    {/* 🆕 개선된 사유 입력 */}
                    <div>
                        <label className="mb-2 block font-pretendard text-sm font-medium text-gray-700">
                            {currentTypeInfo.title} 사유{" "}
                            <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full resize-none border border-gray-300 bg-white p-3 text-sm focus:border-black focus:outline-none"
                            rows={5}
                            placeholder={getReasonPlaceholder(requestType)}
                            maxLength={500}
                        />
                        <div className="mt-1 flex justify-between">
                            <p className="font-pretendard text-xs text-gray-500">
                                상세한 사유를 작성하시면 더 빠른 처리가
                                가능합니다.
                            </p>
                            <span className="font-pretendard text-xs text-gray-400">
                                {reason.length}/500
                            </span>
                        </div>
                    </div>

                    {/* 🆕 추가 안내사항 (요청 타입별) */}
                    <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3">
                        <div className="text-sm text-yellow-800">
                            <p className="mb-1 font-pretendard font-medium">
                                추가 안내사항
                            </p>
                            <ul className="space-y-1 font-pretendard text-xs">
                                {requestType === "cancel" && (
                                    <>
                                        <li>• 결제 취소는 즉시 처리됩니다</li>
                                        <li>
                                            • 카드 승인취소는 2-3일 소요될 수
                                            있습니다
                                        </li>
                                    </>
                                )}
                                {requestType === "refund" && (
                                    <>
                                        <li>
                                            • 상품을 받으신 후 7일 이내 반송
                                            가능
                                        </li>
                                        <li>
                                            • 반송비는 사유에 따라 차등
                                            적용됩니다
                                        </li>
                                        <li>
                                            • 환불은 원래 결제수단으로
                                            처리됩니다
                                        </li>
                                    </>
                                )}
                                {requestType === "exchange" && (
                                    <>
                                        {order.shippingStatus === "confirm" ? (
                                            <>
                                                <li>
                                                    •{" "}
                                                    <strong>
                                                        구매확정 후 교환은 동일
                                                        가격대 상품으로만 가능
                                                    </strong>
                                                </li>
                                                <li>
                                                    • 환불은 절대 불가능하며
                                                    교환만 가능합니다
                                                </li>
                                                <li>
                                                    • 교환 시 추가 금액 발생 시
                                                    추가 결제 필요
                                                </li>
                                                <li>
                                                    • 교환 가능 기간: 구매확정
                                                    후 7일 이내
                                                </li>
                                            </>
                                        ) : (
                                            <>
                                                <li>
                                                    • 교환 상품의 재고 여부를
                                                    먼저 확인해주세요
                                                </li>
                                                <li>
                                                    • 교환 시 추가 금액이 발생할
                                                    수 있습니다
                                                </li>
                                                <li>
                                                    • 1회에 한해 무료 교환
                                                    서비스 제공
                                                </li>
                                            </>
                                        )}
                                    </>
                                )}
                                <li>
                                    • 카카오톡 채널로 진행상황을 실시간
                                    안내드립니다
                                </li>
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
                        {isSubmitting
                            ? "처리 중..."
                            : `${currentTypeInfo.title} 요청`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RefundCancelModal;
