import { OrderData, ShippingStatus } from "@/src/entities/type/interfaces";
import { useSmartUpdateOrderMutation } from "@/src/shared/hooks/react-query/useOrderQuery";
import { useUserQuery } from "@/src/shared/hooks/react-query/useUserQuery";
import { useOrderQuery } from "@src/shared/hooks/react-query/useBenefitQuery";
import {
    CheckCircle,
    Clock,
    CreditCard,
    MapPin,
    Package,
    Phone,
    Truck,
    X,
} from "lucide-react";

// 주문 상세 모달 컴포넌트
const OrderDetailModal = ({
    isOpen,
    onClose,
    order,
}: {
    isOpen: boolean;
    onClose: () => void;
    order: OrderData;
}) => {
    if (!isOpen) return null;

    const { data: user } = useUserQuery();
    const { mutateAsync: smartUpdateOrder } = useSmartUpdateOrderMutation();
    const { refetch: orderListRefetch } = useOrderQuery(user?._id);

    const handleUpdate = async (
        id: string,
        status: string,
        waybillNumber: string | undefined,
    ) => {
        if (
            confirm("구매를 확정하시겠습니까?\n환불/교환을 할 수 없게됩니다.")
        ) {
            try {
                await smartUpdateOrder({
                    orderId: id,
                    shippingStatus: status,
                    trackingNumber: waybillNumber,
                });
                orderListRefetch();
                onClose();
            } catch (err) {
                alert("변경 중 오류 발생!");
            }
        }
    };

    // 배송 상태 정보 함수
    const getShippingStatusInfo = (status: ShippingStatus) => {
        switch (status) {
            case "pending":
                return {
                    text: "주문완료",
                    description: "주문이 완료되었습니다",
                    color: "text-yellow-600",
                    bgColor: "bg-yellow-50",
                    borderColor: "border-yellow-200",
                };
            case "ready":
                return {
                    text: "상품준비중",
                    description: "상품을 포장하고 있습니다",
                    color: "text-blue-600",
                    bgColor: "bg-blue-50",
                    borderColor: "border-blue-200",
                };
            case "shipped":
                return {
                    text: "출고",
                    description: "상품이 출고되었습니다",
                    color: "text-green-600",
                    bgColor: "bg-green-50",
                    borderColor: "border-green-200",
                };
            case "confirm":
                return {
                    text: "구매확정",
                    description: "구매가 확정되었습니다",
                    color: "text-gray-600",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-200",
                };
            case "cancel":
                return {
                    text: "구매취소",
                    description: "구매가 취소되었습니다",
                    color: "text-red-600",
                    bgColor: "bg-red-50",
                    borderColor: "border-red-200",
                };
            default:
                return {
                    text: status,
                    description: "",
                    color: "text-gray-600",
                    bgColor: "bg-gray-50",
                    borderColor: "border-gray-200",
                };
        }
    };

    // 결제 방법 한글 변환
    const getPayMethodText = (method: "EASY_PAY" | "CARD") => {
        return method === "EASY_PAY" ? "간편결제" : "신용카드";
    };

    // 날짜 포맷팅
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

    // 가격 포맷팅
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("ko-KR").format(price) + " KRW";
    };

    // 배송 진행 단계
    const getShippingProgress = (status: ShippingStatus) => {
        const steps = [
            { key: "pending", label: "주문완료" },
            { key: "ready", label: "상품준비중" },
            { key: "shipped", label: "출고" },
            { key: "confirm", label: "구매확정" },
        ];

        const currentIndex = steps.findIndex((step) => step.key === status);

        return steps.map((step, index) => ({
            ...step,
            isActive: index <= currentIndex && status !== "cancel",
            isCurrent: step.key === status,
        }));
    };

    const statusInfo = getShippingStatusInfo(order.shippingStatus);
    const progressSteps = getShippingProgress(order.shippingStatus);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-2 sm:p-4"
            onClick={onClose}
        >
            <div
                className="max-h-[95vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white sm:max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="flex items-center justify-between border-b border-gray-200 p-4 sm:p-6">
                    <div className="min-w-0 flex-1">
                        <h2 className="truncate text-lg font-bold text-gray-900 sm:text-2xl">
                            주문 상세
                        </h2>
                        <p className="mt-1 truncate text-xs text-gray-500 sm:text-sm">
                            주문번호: {order._id}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-2 flex-shrink-0 rounded-full p-2 transition-colors hover:bg-gray-100"
                    >
                        <X className="h-5 w-5 text-gray-600 sm:h-6 sm:w-6" />
                    </button>
                </div>

                <div className="space-y-6 p-4 sm:space-y-8 sm:p-6">
                    {/* 배송 상태 섹션 */}
                    <div
                        className={`${statusInfo.bgColor} ${statusInfo.borderColor} rounded-md border-2 p-4 sm:p-6`}
                    >
                        <div className="mb-4 flex items-center">
                            <Truck
                                className={`h-5 w-5 sm:h-6 sm:w-6 ${statusInfo.color} mr-2 flex-shrink-0 sm:mr-3`}
                            />
                            <div className="min-w-0">
                                <h3
                                    className={`font-pretendard text-lg sm:text-lg ${statusInfo.color}`}
                                >
                                    {statusInfo.text}
                                </h3>
                                <p className="mt-1 text-xs text-gray-600 sm:text-sm">
                                    {statusInfo.description}
                                </p>
                            </div>
                        </div>

                        {/* 배송 진행 상태 바 */}
                        {order.shippingStatus !== "cancel" && (
                            <div className="mt-4 sm:mt-6">
                                <div className="flex items-center justify-between">
                                    {progressSteps.map((step, index) => (
                                        <div
                                            key={step.key}
                                            className="flex flex-1 flex-col items-center"
                                        >
                                            <div
                                                className={`flex h-6 w-6 items-center justify-center rounded-full sm:h-8 sm:w-8 ${
                                                    step.isActive
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-gray-200 text-gray-400"
                                                }`}
                                            >
                                                {step.isActive ? (
                                                    <CheckCircle className="h-3 w-3 sm:h-5 sm:w-5" />
                                                ) : (
                                                    <span className="text-xs font-medium">
                                                        {index + 1}
                                                    </span>
                                                )}
                                            </div>
                                            <span
                                                className={`mt-1 text-center text-[10px] sm:mt-2 sm:text-xs ${
                                                    step.isActive
                                                        ? "font-medium text-blue-600"
                                                        : "text-gray-400"
                                                }`}
                                            >
                                                {step.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* 운송장 정보 */}
                        {order.trackingNumber && (
                            <div className="mt-4 rounded-md border border-gray-200 bg-white p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-600 sm:text-sm">
                                        운송장번호
                                    </span>
                                    <span className="break-all font-mono text-xs font-medium sm:text-sm">
                                        {order.trackingNumber} (우체국)
                                    </span>
                                </div>
                                {order.shippedAt && (
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xs text-gray-600 sm:text-sm">
                                            발송일시
                                        </span>
                                        <span className="text-xs sm:text-sm">
                                            {formatDate(order.shippedAt)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 주문 상품 섹션 */}
                    <div>
                        <h3 className="mb-4 flex items-center font-pretendard text-lg text-gray-900">
                            <Package className="mr-2 h-5 w-5" />
                            주문 상품 ({order.items.length}개)
                        </h3>
                        <div className="space-y-4">
                            {order.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center rounded-md border border-gray-200 p-4"
                                >
                                    <div className="mr-4 flex h-16 w-16 items-center justify-center rounded-md bg-gray-100">
                                        <Package className="h-8 w-8 text-gray-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-pretendard text-lg text-gray-900">
                                            {item.productNm}
                                        </h4>
                                        <div className="mt-1 text-sm text-gray-600">
                                            <span>사이즈: {item.size}</span>
                                            <span className="mx-2">•</span>
                                            <span>색상: {item.color}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-600">
                                            수량: {item.quantity}개
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 결제 정보 섹션 */}
                    <div>
                        <h3 className="mb-4 flex items-center font-pretendard text-lg text-gray-900">
                            <CreditCard className="mr-2 h-5 w-5" />
                            결제 정보
                        </h3>
                        <div className="space-y-3 rounded-md bg-gray-50 p-4 text-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">결제방법</span>
                                <span className="font-pretendard">
                                    {getPayMethodText(order.payMethod)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">결제일시</span>
                                <span>{formatDate(order.createdAt)}</span>
                            </div>
                            {order.paymentId && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">
                                        결제번호
                                    </span>
                                    <span className="font-mono text-sm">
                                        {order.paymentId}
                                    </span>
                                </div>
                            )}
                            <div className="mt-3 border-t border-gray-200 pt-3">
                                <div className="flex items-center justify-between font-pretendard text-lg">
                                    <span>총 결제금액</span>
                                    <span className="font-amstel text-blue-600">
                                        {formatPrice(order.totalPrice)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 배송지 정보 섹션 */}
                    <div>
                        <h3 className="mb-3 flex items-center font-pretendard text-base text-gray-900 sm:mb-4 sm:text-lg">
                            <MapPin className="mr-2 h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" />
                            배송지 정보
                        </h3>
                        <div className="space-y-2 rounded-md bg-gray-50 p-3 sm:p-4">
                            <div className="flex items-center">
                                <Phone className="mr-2 h-3 w-3 flex-shrink-0 text-gray-500 sm:h-4 sm:w-4" />
                                <span className="text-sm font-medium sm:text-base">
                                    {order.userNm}
                                </span>
                                <span className="ml-2 text-sm text-gray-600 sm:text-base">
                                    {order.phoneNumber}
                                </span>
                            </div>
                            <div className="text-sm text-gray-700 sm:text-base">
                                <div className="break-words">
                                    ({order.postcode}) {order.address}
                                </div>
                                <div className="break-words">
                                    {order.detailAddress}
                                </div>
                            </div>
                            {order.deliveryMemo && (
                                <div className="mt-2 rounded border border-yellow-200 bg-yellow-50 p-2 text-xs text-gray-600 sm:text-sm">
                                    <span className="font-medium">
                                        배송요청사항:
                                    </span>{" "}
                                    {order.deliveryMemo}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 푸터 */}
                <div className="border-t border-gray-200 bg-gray-50 p-4 sm:p-6">
                    <div className="flex items-center text-xs text-gray-500 sm:text-sm">
                        <Clock className="mr-2 h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                        <span className="break-words">
                            주문일시: {formatDate(order.createdAt)}
                        </span>
                    </div>

                    {/* 구매확정 버튼 */}
                    {order.shippingStatus !== "confirm" && (
                        <button
                            onClick={() =>
                                handleUpdate(order._id || "", "confirm", "")
                            }
                            className="cursor-pointer rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:px-6 sm:py-3 sm:text-base"
                        >
                            구매확정하기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
