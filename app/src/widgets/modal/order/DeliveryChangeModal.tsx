import { OrderData } from "@src/components/order/interface";
import AddressModal from "@src/widgets/modal/address/AddressModal";
import { useAddress } from "@src/shared/hooks/useAddress";
import { X } from "lucide-react";
import { useState } from "react";

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
    // useAddress hook 사용 (안전한 처리)
    let addressHookResult;
    try {
        addressHookResult = useAddress();
    } catch (error) {
        console.error("useAddress hook 오류:", error);
        addressHookResult = {
            isOpen: false,
            openModal: () => alert("주소 검색 기능을 사용할 수 없습니다."),
            closeModal: () => {},
            onComplete: () => {},
        };
    }

    const {
        isOpen: isAddressModalOpen,
        openModal,
        closeModal,
        onComplete,
    } = addressHookResult;

    // 배송지 변경 가능 여부 확인
    const canChangeDelivery = () => {
        return (
            order.shippingStatus === "pending" ||
            order.shippingStatus === "ready"
        );
    };

    // 초기값을 현재 주문 정보로 설정 (배송 정보만)
    const [newAddress, setNewAddress] = useState({
        postcode: order.postcode,
        address: order.address,
        detailAddress: order.detailAddress,
        deliveryMemo: order.deliveryMemo || "",
    });

    const [reason, setReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 다음 주소 API 연동
    const handlePostcodeSearch = () => {
        try {
            openModal((value) => {
                setNewAddress((prev) => ({
                    ...prev,
                    address: value.address,
                    postcode: value.zonecode,
                }));
            });
        } catch (error: any) {
            alert("주소 검색에 오류가 발생했습니다: " + error.message);
        }
    };

    const handleSubmit = async () => {
        if (!newAddress.postcode.trim() || !newAddress.address.trim()) {
            alert("주소를 입력해주세요.");
            return;
        }
        if (!newAddress.detailAddress.trim()) {
            alert("상세주소를 입력해주세요.");
            return;
        }

        // 변경사항 확인
        const hasChanges =
            newAddress.postcode !== order.postcode ||
            newAddress.address !== order.address ||
            newAddress.detailAddress !== order.detailAddress ||
            newAddress.deliveryMemo !== (order.deliveryMemo || "");

        if (!hasChanges) {
            alert("변경된 내용이 없습니다.");
            return;
        }

        const orderInfo = `
            주문번호: ${order._id}
            기존 배송지: (${order.postcode}) ${order.address} ${order.detailAddress}
            새로운 배송지: (${newAddress.postcode}) ${newAddress.address} ${newAddress.detailAddress}
        `.trim();

        if (
            confirm(
                `배송지를 변경하시겠습니까?\n\n변경된 주소로 상품이 발송됩니다.\n※ 상품 준비 완료 후에는 변경이 불가능합니다.`,
            )
        ) {
            setIsSubmitting(true);
            try {
                await onSubmit({
                    newAddress,
                    reason: reason.trim(),
                    orderInfo,
                });
                onClose();
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    if (!isOpen) return null;

    // 배송지 변경 불가능한 경우
    if (!canChangeDelivery()) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                onClick={onClose}
            >
                <div
                    className="w-full max-w-md rounded-lg bg-white"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                        <h3 className="font-pretendard text-lg font-bold text-gray-900">
                            배송지 변경 불가
                        </h3>
                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gray-100 active:bg-gray-200"
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
                            className="mt-4 w-full bg-gray-100 px-4 py-2.5 font-pretendard text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200"
                        >
                            확인
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
                onClick={onClose}
                style={{ touchAction: "manipulation" }}
            >
                <div
                    className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        WebkitOverflowScrolling: "touch",
                        overscrollBehavior: "contain",
                    }}
                >
                    {/* 헤더 */}
                    <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
                        <h3 className="font-pretendard text-lg font-bold text-gray-900">
                            변경할 배송지 변경
                        </h3>
                        <button
                            onClick={onClose}
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gray-100 active:bg-gray-200"
                        >
                            <X className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    <div className="space-y-4 p-4">
                        {/* 주소 정보 */}
                        <div>
                            <h4 className="font-pretendard text-sm font-medium text-gray-900">
                                변경할 배송 주소
                            </h4>

                            {/* 주소 검색 */}
                            <div className="relative -mt-2 w-full">
                                <input
                                    type="text"
                                    value={newAddress.address}
                                    onChange={(e) =>
                                        setNewAddress((prev) => ({
                                            ...prev,
                                            address: e.target.value,
                                        }))
                                    }
                                    className="h-[5vh] w-full border border-gray-300 bg-white px-4 pr-28 text-sm focus:border-black focus:outline-none"
                                    placeholder="주소"
                                    readOnly
                                />
                                <input
                                    type="hidden"
                                    value={newAddress.postcode}
                                    onChange={(e) =>
                                        setNewAddress((prev) => ({
                                            ...prev,
                                            postcode: e.target.value,
                                        }))
                                    }
                                />
                                <button
                                    type="button"
                                    onClick={handlePostcodeSearch}
                                    className="absolute right-1 top-[4vh] -translate-y-1/2 bg-black px-4 py-[1.2vh] text-sm text-white hover:bg-gray-800"
                                >
                                    주소찾기
                                </button>
                            </div>

                            {/* 상세주소 */}
                            <div>
                                <input
                                    type="text"
                                    value={newAddress.detailAddress}
                                    onChange={(e) =>
                                        setNewAddress((prev) => ({
                                            ...prev,
                                            detailAddress: e.target.value,
                                        }))
                                    }
                                    className="h-[5vh] w-full border border-gray-300 bg-white px-4 text-sm focus:border-black focus:outline-none"
                                    placeholder="상세주소를 입력해주세요"
                                />
                            </div>
                        </div>

                        {/* 배송 메모 */}
                        <div>
                            <label className="mb-1 block font-pretendard text-xs font-medium text-gray-700">
                                변경할 배송 요청사항
                            </label>
                            <textarea
                                value={newAddress.deliveryMemo}
                                onChange={(e) =>
                                    setNewAddress((prev) => ({
                                        ...prev,
                                        deliveryMemo: e.target.value,
                                    }))
                                }
                                className="w-full resize-none border border-gray-300 bg-white p-3 text-sm focus:border-black focus:outline-none"
                                rows={2}
                                placeholder="배송 시 요청사항을 입력해주세요 (선택사항)"
                                maxLength={100}
                            />
                            <p className="mt-1 font-pretendard text-xs text-gray-400">
                                {newAddress.deliveryMemo.length}/100
                            </p>
                        </div>

                        {/* 주의사항 */}
                        <div className="rounded-sm border border-yellow-200 bg-yellow-50 p-3">
                            <div className="text-sm text-yellow-800">
                                <p className="mb-1 font-pretendard font-medium">
                                    배송지 변경 안내
                                </p>
                                <ul className="space-y-1 font-pretendard text-xs">
                                    <li>
                                        • 상품 준비 완료 후에는 배송지 변경이
                                        불가능합니다
                                    </li>
                                    <li>• 변경된 주소로 상품이 발송됩니다</li>
                                    <li>
                                        • 잘못된 주소 입력으로 인한 배송 지연은
                                        고객 책임입니다
                                    </li>
                                    <li>
                                        • 도서/산간 지역은 추가 배송료가 발생할
                                        수 있습니다
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* 푸터 */}
                    <div className="sticky bottom-0 flex space-x-3 border-t border-gray-200 bg-white px-4 py-3">
                        <button
                            onClick={onClose}
                            className="flex-1 bg-gray-100 px-6 py-2.5 font-pretendard text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200"
                        >
                            취소
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex-1 bg-black px-6 py-2.5 font-pretendard text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            {isSubmitting ? "처리 중..." : "배송지 변경"}
                        </button>
                    </div>
                </div>
            </div>

            {/* AddressModal 렌더링 */}
            {isAddressModalOpen && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50"
                    style={{ zIndex: 9999 }}
                >
                    {isAddressModalOpen ? (
                        <AddressModal
                            onComplete={onComplete}
                            onClose={closeModal}
                        />
                    ) : (
                        <div className="rounded-lg bg-white p-6">
                            <p>AddressModal 컴포넌트를 찾을 수 없습니다.</p>
                            <button
                                onClick={closeModal}
                                className="mt-4 rounded bg-gray-500 px-4 py-2 text-white"
                            >
                                닫기
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default DeliveryChangeModal;
