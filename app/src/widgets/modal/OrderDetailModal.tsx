import { OrderData, ShippingStatus } from "@/src/entities/type/interfaces";
import {
    useOrderQuery,
    useSmartUpdateOrderMutation,
} from "@/src/shared/hooks/react-query/useOrderQuery";
import { useUserQuery } from "@/src/shared/hooks/react-query/useUserQuery";
import { CheckCircle, X } from "lucide-react";
import Image from "next/image";
import DefaultImage from "../../../../public/images/chill.png";

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
    const { data: user } = useUserQuery();
    const { mutateAsync: smartUpdateOrder } = useSmartUpdateOrderMutation();
    const { refetch: orderListRefetch } = useOrderQuery(user?._id);

    if (!isOpen) return null;

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
    const getPayMethodText = (method: "NAVER_PAY" | "KAKAO_PAY" | "CARD") => {
        return method === "NAVER_PAY" || "KAKAO_PAY" ? "간편결제" : "신용카드";
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={onClose}
            style={{ touchAction: "manipulation" }}
        >
            <div
                className="h-[70vh] w-[90vw] overflow-y-auto rounded-lg bg-white sm:h-[90vh] sm:w-[35vw]"
                onClick={(e) => e.stopPropagation()}
                style={{
                    WebkitOverflowScrolling: "touch",
                    overscrollBehavior: "contain",
                }}
            >
                {/* 헤더 */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
                    <div className="min-w-0 flex-1 pr-2">
                        <h2 className="truncate font-pretendard text-lg font-[700] text-gray-900">
                            주문 상세
                        </h2>
                        <p className="mt-1 truncate text-xs text-gray-500">
                            주문번호: {order._id}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gray-100 active:bg-gray-200"
                        style={{ touchAction: "manipulation" }}
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                <div className="space-y-4 p-4">
                    {/* 배송 상태 섹션 */}
                    <div
                        className={`${statusInfo.bgColor} ${statusInfo.borderColor} rounded-lg border-2 p-4`}
                    >
                        <div className="mb-3 flex items-center">
                            <div className="min-w-0">
                                <h3
                                    className={`font-pretendard text-base font-bold ${statusInfo.color}`}
                                >
                                    {statusInfo.text}
                                </h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    {statusInfo.description}
                                </p>
                            </div>
                        </div>

                        {/* 배송 진행 상태 바 */}
                        {order.shippingStatus !== "cancel" && (
                            <div className="mt-4">
                                <div className="flex items-center justify-between">
                                    {progressSteps.map((step, index) => (
                                        <div
                                            key={step.key}
                                            className="flex flex-1 flex-col items-center"
                                        >
                                            <div
                                                className={`flex h-6 w-6 items-center justify-center rounded-full ${
                                                    step.isActive
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-gray-200 text-gray-400"
                                                }`}
                                            >
                                                {step.isActive ? (
                                                    <CheckCircle className="h-4 w-4" />
                                                ) : (
                                                    <span className="font-pretendard text-xs">
                                                        {index + 1}
                                                    </span>
                                                )}
                                            </div>
                                            <span
                                                className={`mt-1 text-center font-pretendard text-xs ${
                                                    step.isActive
                                                        ? "text-blue-600"
                                                        : "text-gray-400"
                                                } ${index === 1 ? "px-1" : ""}`}
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
                            <div className="mt-3 rounded-md border border-gray-200 bg-white p-3">
                                <div className="flex flex-col space-y-1">
                                    <div className="flex justify-between">
                                        <span className="font-pretendard text-xs font-medium text-gray-700">
                                            운송장번호
                                        </span>
                                        <span className="break-all font-pretendard text-xs text-blue-600">
                                            {order.trackingNumber} (우체국)
                                        </span>
                                    </div>
                                    {order.shippedAt && (
                                        <div className="flex justify-between">
                                            <span className="font-pretendard text-xs font-medium text-gray-700">
                                                발송일시
                                            </span>
                                            <span className="text-xs text-gray-600">
                                                {formatDate(order.shippedAt)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 주문 상품 섹션 */}
                    <div>
                        <h3 className="mb-3 flex items-center font-pretendard text-base font-semibold text-gray-900">
                            주문 상품 ({order.items.length}개)
                        </h3>
                        <div className="space-y-2">
                            {order.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center rounded-md border border-gray-200 p-3"
                                >
                                    <div className="mr-3 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-md p-1">
                                        <Image
                                            alt="image"
                                            className="h-auto w-auto"
                                            width={1000}
                                            height={1000}
                                            objectFit="cover"
                                            src={
                                                item.image
                                                    ? item.image[0]
                                                    : DefaultImage
                                            }
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="truncate font-pretendard text-sm font-medium text-gray-900">
                                            {item.productNm}
                                        </h4>
                                        <div className="mt-1 text-xs text-gray-600">
                                            <span>사이즈: {item.size}</span>
                                            <span className="mx-2">•</span>
                                            <span>색상: {item.color}</span>
                                            <span className="mx-2">•</span>
                                            <span>수량: {item.quantity}개</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 결제 정보 섹션 */}
                    <div>
                        <h3 className="mb-3 flex items-center font-pretendard text-base font-semibold text-gray-900">
                            결제 정보
                        </h3>
                        <div className="space-y-2 rounded-md bg-gray-50 p-3">
                            <div className="flex items-center justify-between">
                                <span className="whitespace-nowrap font-pretendard text-sm font-[500] text-gray-700">
                                    결제방법
                                </span>
                                <span className="font-pretendard text-xs text-gray-900">
                                    {getPayMethodText(order.payMethod)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="whitespace-nowrap font-pretendard text-sm font-[500] text-gray-700">
                                    결제일시
                                </span>
                                <span className="text-xs text-gray-600">
                                    {formatDate(order.createdAt)}
                                </span>
                            </div>
                            {order.paymentId && (
                                <div className="flex items-center justify-between">
                                    <span className="whitespace-nowrap font-pretendard text-sm font-[500] text-gray-700">
                                        결제번호
                                    </span>
                                    <span className="ms-20 break-all text-end font-mono text-xs text-gray-600">
                                        {order.paymentId}
                                    </span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-pretendard text-sm font-[600] text-gray-900">
                                        총 결제금액
                                    </span>
                                    <span className="font-amstel text-lg font-bold text-blue-600">
                                        {formatPrice(order.totalPrice)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 배송지 정보 섹션 */}
                    <div>
                        <h3 className="mb-3 flex items-center font-pretendard text-base font-semibold text-gray-900">
                            배송지 정보
                        </h3>
                        <div className="space-y-2 rounded-md bg-gray-50 p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">
                                    {order.userNm}
                                </span>
                                <span className="text-xs text-gray-600">
                                    {order.phoneNumber}
                                </span>
                            </div>
                            <div className="text-xs text-gray-700">
                                <div className="break-words">
                                    ({order.postcode}) {order.address}
                                </div>
                                <div className="break-words font-medium">
                                    {order.detailAddress}
                                </div>
                            </div>
                            {order.deliveryMemo && (
                                <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 p-2">
                                    <div className="text-xs">
                                        <span className="font-pretendard font-medium text-gray-800">
                                            배송요청사항:
                                        </span>
                                        <p className="mt-1 text-gray-700">
                                            {order.deliveryMemo}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 푸터 정보 */}
                    <div className="border-t border-gray-200 pt-3">
                        <div className="flex items-center text-xs text-gray-500">
                            <span className="break-words">
                                주문일시: {formatDate(order.createdAt)}
                            </span>
                        </div>

                        {/* 구매확정 버튼 */}
                        {order.shippingStatus === "shipped" && (
                            <div className="mt-3 space-y-2">
                                <button
                                    onClick={() =>
                                        handleUpdate(
                                            order._id || "",
                                            "confirm",
                                            "",
                                        )
                                    }
                                    className="w-full cursor-pointer rounded-md bg-black px-4 py-3 font-pretendard text-sm font-medium text-white transition-colors hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 active:bg-black/90"
                                    style={{ touchAction: "manipulation" }}
                                >
                                    구매확정하기
                                </button>
                                <div className="text-xs leading-relaxed text-red-500">
                                    <p className="mb-1">
                                        구매확정 이후에는 단순 변심에 의한 교환
                                        및 반품이 불가합니다.
                                    </p>
                                    <p>
                                        제품에 이상이 있는 경우에는 구매확정 전
                                        반드시 채널톡으로 문의주세요.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
