"use client";

import { OrderData } from "@src/components/order/interface";
import AddressModal from "@src/widgets/modal/address/AddressModal";
import { useAddress } from "@src/shared/hooks/useAddress";
import { X } from "lucide-react";
import { useState } from "react";
import ModalWrap from "../etc/ModalWrap";

const DeliveryChangeModal = ({
    isOpen,
    onClose,
    onSubmit,
    order,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        newAddress: {
            postcode: string;
            address: string;
            detailAddress: string;
            deliveryMemo: string;
        };
        reason: string;
        orderInfo: string;
    }) => void;
    order: OrderData;
}) => {
    // useAddress 훅 및 상태 관리 로직은 그대로 유지
    const {
        isOpen: isAddressModalOpen,
        openModal,
        closeModal,
        onComplete,
    } = useAddress();

    const [newAddress, setNewAddress] = useState({
        postcode: order.postcode,
        address: order.address,
        detailAddress: order.detailAddress,
        deliveryMemo: order.deliveryMemo || "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const canChangeDelivery = () => {
        return (
            order.shippingStatus === "pending" ||
            order.shippingStatus === "ready"
        );
    };

    const handlePostcodeSearch = () => {
        openModal((value) => {
            setNewAddress((prev) => ({
                ...prev,
                address: value.address,
                postcode: value.zonecode,
            }));
        });
    };

    const handleSubmit = async () => {
        // 유효성 검사 로직은 유지
        const hasChanges =
            newAddress.postcode !== order.postcode ||
            newAddress.address !== order.address ||
            newAddress.detailAddress !== order.detailAddress ||
            newAddress.deliveryMemo !== (order.deliveryMemo || "");

        if (!hasChanges) {
            console.warn("변경된 내용이 없습니다.");
            return;
        }

        const orderInfo = `
            주문번호: ${order._id}
            기존 배송지: (${order.postcode}) ${order.address} ${order.detailAddress}
            새로운 배송지: (${newAddress.postcode}) ${newAddress.address} ${newAddress.detailAddress}
        `.trim();

        setIsSubmitting(true);
        try {
            await onSubmit({
                newAddress,
                reason: "사용자 배송지 변경 요청", // reason은 별도로 받지 않으므로 고정값 또는 제거
                orderInfo,
            });
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // 배송지 변경 불가능한 경우의 UI
    if (!canChangeDelivery()) {
        return (
            <ModalWrap
                onClose={onClose}
                className="w-full max-w-md rounded-lg bg-white p-0"
            >
                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <h3 className="font-pretendard text-lg font-bold text-gray-900">
                        배송지 변경 불가
                    </h3>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>
                <div className="p-4">
                    <div className="rounded-sm border border-red-200 bg-red-50 p-3">
                        <p className="font-pretendard text-sm text-red-800">
                            상품이 이미 출고되어 배송지 변경이 불가능합니다.
                        </p>
                        <p className="mt-1 font-pretendard text-xs text-red-600">
                            배송지 변경은 상품 준비 중일 때만 가능합니다.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="mt-4 w-full bg-gray-100 px-4 py-2.5 font-pretendard text-sm font-medium"
                    >
                        확인
                    </button>
                </div>
            </ModalWrap>
        );
    }

    // 배송지 변경 가능한 경우의 UI
    return (
        <>
            <ModalWrap
                onClose={onClose}
                className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-0"
            >
                {/* 헤더 */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-4 py-3">
                    <h3 className="font-pretendard text-lg font-bold text-gray-900">
                        배송지 변경
                    </h3>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                    >
                        <X className="h-5 w-5 text-gray-600" />
                    </button>
                </div>

                <div className="space-y-4 p-4">
                    {/* 주소 정보 및 입력 필드 UI ... (기존 코드와 동일) */}
                    <div className="relative mt-2 flex flex-col space-y-2">
                         <div className="relative">
                            <input
                                type="text"
                                value={newAddress.address}
                                className="h-[5vh] w-full border border-gray-300 bg-gray-50 px-4 pr-28 text-sm"
                                placeholder="주소"
                                readOnly
                            />
                             <button
                                type="button"
                                onClick={handlePostcodeSearch}
                                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black px-4 py-[1.2vh] text-sm text-white hover:bg-gray-800"
                            >
                                주소찾기
                            </button>
                        </div>
                        <input
                            type="text"
                            value={newAddress.detailAddress}
                            onChange={(e) => setNewAddress((prev) => ({...prev, detailAddress: e.target.value}))}
                            className="h-[5vh] w-full border border-gray-300 bg-white px-4 text-sm focus:border-black"
                            placeholder="상세주소를 입력해주세요"
                        />
                    </div>
                     {/* 배송 메모 */}
                    <div>
                        <textarea
                            value={newAddress.deliveryMemo}
                            onChange={(e) => setNewAddress((prev) => ({...prev, deliveryMemo: e.target.value}))}
                            className="w-full resize-none border border-gray-300 p-3 text-sm"
                            rows={2}
                            placeholder="배송 시 요청사항을 입력해주세요 (선택사항)"
                            maxLength={100}
                        />
                    </div>
                     {/* 주의사항 */}
                    <div className="rounded-sm border border-yellow-200 bg-yellow-50 p-3">
                        <p className="mb-1 font-pretendard font-medium text-sm text-yellow-800">배송지 변경 안내</p>
                        {/* ... 주의사항 내용 ... */}
                    </div>
                </div>

                {/* 푸터 */}
                <div className="sticky bottom-0 flex space-x-3 border-t bg-white px-4 py-3">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-100 px-6 py-2.5 font-pretendard text-sm font-medium"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 bg-black px-6 py-2.5 font-pretendard text-sm font-medium text-white disabled:bg-gray-400"
                    >
                        {isSubmitting ? "처리 중..." : "배송지 변경"}
                    </button>
                </div>
            </ModalWrap>

            {/* AddressModal 렌더링 (z-index가 더 높아야 함) */}
            {isAddressModalOpen && (
                <AddressModal onComplete={onComplete} onClose={closeModal} />
            )}
        </>
    );
};

export default DeliveryChangeModal;