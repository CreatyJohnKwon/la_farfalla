import {
    useOrderQuery,
    useSmartUpdateOrderMutation,
    useUpdateAddressOrder,
} from "@src/shared/hooks/react-query/useOrderQuery";
import { useUserQuery } from "@src/shared/hooks/react-query/useUserQuery";
import { CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import DefaultImage from "../../../../../public/images/chill.png";
import { useState } from "react";
import CancelOrderModal from "./CancelOrderModal";
import DeliveryChangeModal from "./DeliveryChangeModal";
import SpecialReviewModal from "../review/SpecialReviewModal";
import { specialReviewItem } from "@src/entities/type/products";
import { OrderData, OrderItem, ShippingStatus } from "@src/components/order/interface";
import useOrder from "@src/shared/hooks/useOrder";
import { sendMail } from "@src/shared/lib/server/order";

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
    const { data: user , refetch: refetchUser } = useUserQuery();
    const { mutateAsync: smartUpdateOrder } = useSmartUpdateOrderMutation();
    const { refetch: orderListRefetch } = useOrderQuery(user?._id);

    const updateAddressMutation = useUpdateAddressOrder();

    const [productItem, setProductItem] = useState<specialReviewItem>({
        orderId: "",
        productId: "",
        productImage: [],
        productName: ""
    });
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [cancelType, setCancelType] = useState<"cancel" | "exchange" | "return">("cancel");
    const [isDeliveryChangeModalOpen, setIsDeliveryChangeModalOpen] =useState(false); // 🆕 추가

    const { addEarnMileage } = useOrder();

    if (!isOpen) return null;

    // 🆕 개선된 handleChannel 함수 (환불/취소/교환)
    const handleSubmit = async (data: {
        type: string;
        reason: string;
        orderInfo: string;
    }) => {
        try {
            await smartUpdateOrder({
                orderId: order._id,
                shippingStatus: data.type,
                trackingNumber: order.trackingNumber || "",
            });

            const actionName = data.type === "cancel" ? "주문 취소가" : data.type === "return" ? "상품 반품이" : data.type === "exchange" ? "상품 교환이" : "상담이";
            const body = JSON.stringify({
                ...order,
                shippingStatus: data.type,
                description: data.reason
            });

            alert(`${actionName} 성공적으로 요청되었습니다.`);
            sendMail(body);
        } catch (error) {
            // 클립보드 실패 시 prompt 사용
            const actionName = data.type === "cancel" ? "주문 취소" : data.type === "return" ? "반품" : data.type === "exchange" ? "교환" : "상담";
            const predefinedMessage: string = `
                ${actionName} 요청드립니다.

                ${data.orderInfo}

                ${actionName} 사유:
                ${data.reason}

                빠른 처리 부탁드립니다.
            `.trim();
            // 클립보드에 복사
            await navigator.clipboard.writeText(predefinedMessage);

            alert(`${actionName} 요청 메시지가 복사되었습니다!\n카카오톡 채널에서 붙여넣기(Ctrl+V) 해주세요.`);
            const message = `${actionName} 요청 메시지를 복사해서 채널에 보내주세요:`;

            //prompt 시작
            prompt(message, predefinedMessage);

            // 1초 후 채널 열기
            setTimeout(() => {
                window.open(
                    "https://pf.kakao.com/_Uxfaxin/chat",
                    "channel_talk_request",
                );
            }, 1000);
        } finally {
            refetchUser();
            orderListRefetch();
        }
    };

    // 🆕 배송지 변경 처리 함수 (개선된 버전)
    const handleDeliveryChange = async (data: {
        newAddress: {
            postcode: string;
            address: string;
            detailAddress: string;
            deliveryMemo: string;
        };
        reason: string;
        orderInfo: string;
    }) => {
        try {
            // 배송지 변경 API 호출
            await updateAddressMutation.mutateAsync({
                orderId: order._id || "",
                newAddress: data.newAddress,
                reason: data.reason.trim(),
                orderInfo: data.orderInfo,
            });

            // 성공 시 모달 닫기
            alert("배송지가 성공적으로 변경되었습니다.");
            onClose();
        } catch (error) {
            console.error("배송지 변경 API 실패:", error);

            // API 실패 시 카카오톡 채널로 수동 요청 안내
            const predefinedMessage = `
                 [배송지 변경 요청]
                 주문번호: ${order._id}

                 기존 배송지: (${order.postcode}) ${order.address} ${order.detailAddress}
                 새 배송지: (${data.newAddress.postcode}) ${data.newAddress.address} ${data.newAddress.detailAddress}

                 변경 사유: ${data.reason || "배송지 변경 요청"}

                 새로운 배송 요청사항: ${data.newAddress.deliveryMemo || "없음"}

                 빠른 처리 부탁드립니다.
            `.trim();

            try {
                // 클립보드에 복사
                await navigator.clipboard.writeText(predefinedMessage);

                alert(
                    "배송지 변경에 실패했습니다.\n요청 메시지가 클립보드에 복사되었습니다.\n카카오톡 채널에서 붙여넣기(Ctrl+V) 해주세요.",
                );
            } catch (clipboardError) {
                // 클립보드 복사 실패 시 prompt 사용
                console.error("클립보드 복사 실패:", clipboardError);

                alert(
                    "배송지 변경에 실패했습니다.\n아래 메시지를 복사해서 카카오톡 채널로 문의해주세요.",
                );

                // prompt로 메시지 표시 (사용자가 직접 복사할 수 있도록)
                prompt(
                    "다음 메시지를 복사해서 카카오톡 채널에 보내주세요:",
                    predefinedMessage,
                );
            }

            // 1초 후 카카오톡 채널 열기
            setTimeout(() => {
                window.open(
                    "https://pf.kakao.com/_Uxfaxin/chat",
                    "channel_talk_delivery_change",
                    "noopener,noreferrer",
                );
            }, 1000);
        }
    };

    const handleUpdate = async (
        id: string,
        status: string,
        waybillNumber: string | undefined,
        totalPrice: number
    ) => {
        if (
            confirm("구매를 확정하시겠습니까?\n구매확정 시, 7일 이내에 반품 및 교환을 할 수 있게 됩니다.")
        ) {
            try {
                await smartUpdateOrder({
                    orderId: id,
                    shippingStatus: status,
                    trackingNumber: waybillNumber,
                });
                await addEarnMileage(id, "상품 구매 적립", Math.round(totalPrice/100));
                refetchUser();
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
                    text: "주문취소",
                    description: "주문이 취소되었습니다",
                    color: "text-red-600",
                    bgColor: "bg-red-50",
                    borderColor: "border-red-200",
                };
            case "return":
                return {
                    text: "반품요청",
                    description: "반품이 요청되었습니다",
                    color: "text-red-600",
                    bgColor: "bg-red-50",
                    borderColor: "border-red-200",
                };
            case "exchange":
                return {
                    text: "교환요청",
                    description: "교환이 요청되었습니다",
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

    const handleOpenModal = (type: "cancel" | "exchange" | "return") => {
        setCancelType(type);
        setIsRefundModalOpen(true);
    };

    // 구매 확정 7일 이내 확인
    const confirmDateCalc = (): boolean => {
        if (order.shippingStatus !== "confirm") return false;

        if (
            order.shippingStatus === "confirm" &&
            order.confirmAt &&
            new Date().getTime() - new Date(order.confirmAt).getTime() <= 7 * 24 * 60 * 60 * 1000
        ) {
            return true;
        }
        return false
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
            onClick={onClose}
            style={{ touchAction: "manipulation" }}
        >
            <div
                className="max-h-[90vh] w-[90vw] overflow-y-auto rounded-lg bg-white sm:w-[40vw]"
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
                        className="flex text-2xl flex-shrink-0 items-center justify-center font-[300] hover:text-gray-500 text-gray-400 "
                        style={{ touchAction: "manipulation" }}
                    >
                        &times;
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

                        {/* 배송 진행 상태 바 또는 취소 아이콘 */}
                        {order.shippingStatus === "cancel" ||
                            order.shippingStatus === "return" || 
                            order.shippingStatus === "exchange" ? (
                            // 주문 취소/교환 및 반품 상태일 때 보여줄 아이콘과 텍스트
                            <div className={`mt-4 flex flex-col items-center justify-center space-y-2 ${statusInfo.color}`}>
                                <XCircle className="h-10 w-10" />
                                <p className="font-pretendard text-sm font-medium">
                                    {`${order.shippingStatus === "cancel" ? "주문이 취소되었습니다" : 
                                        order.shippingStatus === "exchange" ? "교환 요청 중" : "반품 요청 중"}`}
                                </p>
                            </div>
                        ) : (
                            // 기존 배송 진행 상태 바
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
                        {order.trackingNumber && (order.shippingStatus === "shipped" || order.shippingStatus === "confirm") && (
                            <div className="mt-3 rounded-sm border border-gray-200 bg-white p-3">
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
                        <span className="mb-3 flex items-center font-pretendard text-base font-semibold text-gray-900">
                            주문 상품
                        </span>
                        <div className="space-y-2">
                            {order.items.map((item: OrderItem, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-center rounded-sm border border-gray-200 hover:border-gray-300 p-3"
                                >
                                    <div className="mr-3 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-sm p-1">
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
                                    <div className="min-w-0 flex-1 font-pretendard">
                                        <h4 className="truncate text-sm text-gray-900">
                                            {item.productNm}
                                        </h4>
                                        {item.additional ?
                                            <div className="mt-1 text-xs text-gray-600">
                                                <span>{item.additional}</span>
                                                <span className="mx-2">•</span>
                                                <span>{item.quantity}개</span>
                                            </div>
                                            :
                                            <div className="mt-1 text-xs text-gray-600">
                                                <span>{item.size}</span>
                                                <span className="mx-2">•</span>
                                                <span>{item.color}</span>
                                                <span className="mx-2">•</span>
                                                <span>{item.quantity}개</span>
                                            </div>
                                        }

                                    </div>

                                    {order.shippingStatus === "confirm" ? (
                                        <button 
                                            className="text-xs underline text-red-500 me-1"
                                            onClick={() => {
                                                setProductItem({
                                                    orderId: order._id || "",
                                                    productId: item.productId,
                                                    productName: item.productNm,
                                                    productImage: item.image,
                                                });
                                                setIsReviewModalOpen(true);
                                            }}
                                        >
                                            리뷰 쓰기
                                        </button>
                                    ) : (<></>)}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 결제 정보 섹션 */}
                    <div>
                        <h3 className="mb-3 flex items-center font-pretendard text-base font-semibold text-gray-900">
                            결제 정보
                        </h3>
                        <div className="space-y-2 rounded-sm bg-gray-50 p-3">
                            {/* <div className="flex items-center justify-between">
                                <span className="whitespace-nowrap font-pretendard text-sm font-[500] text-gray-700">
                                    결제방법
                                </span>
                                <span className="font-pretendard text-xs text-gray-900">
                                    {getPayMethodText(order.payMethod)}
                                </span>
                            </div> */}
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
                                    <span 
                                        className="ms-20 break-all text-end font-mono text-xs text-gray-600 truncate hover:text-gray-900 cursor-pointer hover:underline"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${order.paymentId}`);
                                            alert("클립보드에 복사 되었습니다")
                                        }}
                                    >
                                        {order.paymentId}
                                    </span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="font-pretendard text-sm font-[600] text-gray-900">
                                        총 결제금액
                                    </span>
                                    <span className="font-amstel text-lg font-bold text-black">
                                        {formatPrice(order.totalPrice)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 배송지 정보 섹션 */}
                    <div>
                        <div className="mb-3 flex flex-row items-center justify-between">
                            <span className="font-pretendard text-base font-semibold text-gray-900">
                                배송지 정보
                            </span>
                            {order.shippingStatus === "ready" ||
                                order.shippingStatus === "pending" ? 
                            (
                                <span
                                    className="cursor-pointer font-pretendard text-xs font-[500] text-gray-500 underline hover:text-gray-900"
                                    onClick={() =>
                                        setIsDeliveryChangeModalOpen(true)
                                    } // 🆕 모달 열기
                                >
                                    배송지 변경하기
                                </span>
                            ) : (
                                <></>
                            )}
                        </div>
                        <div className="space-y-2 rounded-sm bg-gray-50 p-3">
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
                                <div className="mt-2 rounded-sm border border-yellow-200 bg-yellow-50 p-2">
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
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="break-words">
                                주문일시: {formatDate(order.createdAt)}
                            </span>
                            {order.shippingStatus === "pending" ? (
                                <span
                                    className="cursor-pointer font-pretendard text-xs font-[500] text-red-400 underline hover:text-red-500"
                                    onClick={() => handleOpenModal("cancel")}
                                >
                                    주문 취소하기
                                </span>
                            ) : order.shippingStatus === "shipped" || confirmDateCalc() ? (
                                <span
                                    className="cursor-pointer font-pretendard text-xs font-[500] text-red-400 underline hover:text-red-500"
                                    onClick={() => handleOpenModal("exchange")}
                                >
                                    반품 및 교환하기
                                </span>
                            ) : <></> }
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
                                            order.totalPrice
                                        )
                                    }
                                    className="w-full cursor-pointer rounded-sm bg-black px-4 py-3 font-pretendard text-sm font-medium text-white transition-colors hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 active:bg-black/90"
                                    style={{ touchAction: "manipulation" }}
                                >
                                    구매확정하기
                                </button>
                                <div className="text-xs leading-relaxed text-red-500">
                                    <p className="mb-1">
                                        구매확정 후, 7일 이내까지 단순 변심에 의한 교환
                                        및 반품이 가능합니다.
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

            {/* 🆕 환불/취소 모달 */}
            <CancelOrderModal
                isOpen={isRefundModalOpen}
                onClose={() => setIsRefundModalOpen(false)}
                onSubmit={handleSubmit}
                order={order}
                type={cancelType}
            />

            {/* 🆕 배송지 변경 모달 */}
            <DeliveryChangeModal
                isOpen={isDeliveryChangeModalOpen}
                onClose={() => setIsDeliveryChangeModalOpen(false)}
                onSubmit={handleDeliveryChange}
                order={order}
            />

            {isReviewModalOpen && (
                <SpecialReviewModal 
                    onClose={() => setIsReviewModalOpen(false)} 
                    productItem={productItem}
                />
            )}
        </div>
    );
};

export default OrderDetailModal;
