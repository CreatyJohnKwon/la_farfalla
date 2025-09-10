import { usePostManageCouponMutation } from "@src/shared/hooks/react-query/useBenefitQuery";
import { useState } from "react";

interface CouponCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRefetch: () => void;
}

const CouponCreateModal = ({
    isOpen,
    onClose,
    onRefetch,
}: CouponCreateModalProps) => {
    if (!isOpen) return null;

    const [selectType, setSelectType] = useState("");
    const [selectDiscountType, setSelectDiscountType] = useState("");
    const [discountValue, setDiscountValue] = useState("");
    const mutation = usePostManageCouponMutation();

    const handleSubmit = async (formData: FormData) => {
        const data = {
            name: formData.get("name") as string,
            code: (formData.get("code") as string).toUpperCase(),
            description: (formData.get("description") as string)?.trim() || "",
            type: formData.get("type") as "common" | "personal" | "event",
            discountType: formData.get("discountType") as
                | "fixed"
                | "percentage",
            discountValue:
                parseFloat(formData.get("discountValue") as string) || 0,
            startAt: new Date(formData.get("startAt") as string),
            endAt: new Date(formData.get("endAt") as string),
            maxUsage: formData.get("maxUsage")
                ? Number(formData.get("maxUsage"))
                : null,
            maxUsagePerUser: formData.get("maxUsagePerUser")
                ? Number(formData.get("maxUsagePerUser"))
                : null,
            isActive: formData.get("isActive") === "on",
        };

        mutation.mutate(data, {
            onSuccess: () => {
                onClose();
                onRefetch();
            },
            onError: (error) => {
                console.error("쿠폰 생성 실패", error);
                alert("쿠폰 생성에 실패했습니다. 다시 시도해주세요.");
            },
        });
    };

    const handleDiscountTypeChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
        setSelectDiscountType(e.target.value);
        setDiscountValue("");
    };

    const handleDiscountValueChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const val = e.target.value;
        if (val === "") {
            setDiscountValue("");
            return;
        }
        const num = Number(val);
        if (isNaN(num)) return;

        const max = selectDiscountType === "percentage" ? 100 : 1000000;
        const min = 0;

        if (num >= min && num <= max) {
            setDiscountValue(val);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={onClose}
        >
            <div
                className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium">새 쿠폰 템플릿 생성</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <form
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleSubmit(formData);
                    }}
                >
                    {/* 기본 정보 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                쿠폰명 *
                            </label>
                            <input
                                name="name"
                                type="text"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                placeholder="쿠폰명을 입력하세요"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                쿠폰 코드 *
                            </label>
                            <input
                                name="code"
                                type="text"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase"
                                placeholder="COUPON2024"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">
                            설명 *
                        </label>
                        <textarea
                            name="description"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                            rows={3}
                            placeholder="쿠폰 설명을 입력하세요"
                            required
                        />
                    </div>

                    {/* 타입 및 할인 설정 */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                쿠폰 타입 *
                            </label>
                            <select
                                name="type"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                onChange={(e) => setSelectType(e.target.value)}
                                required
                            >
                                <option value="">선택하세요</option>
                                <option value="common">공용쿠폰</option>
                                <option value="personal">개인쿠폰</option>
                                <option value="event">이벤트쿠폰</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                할인 방식 *
                            </label>
                            <select
                                name="discountType"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                onChange={handleDiscountTypeChange}
                                required
                            >
                                <option value="">선택하세요</option>
                                <option value="fixed">고정금액</option>
                                <option value="percentage">퍼센트</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                할인 값 *
                            </label>
                            <input
                                name="discountValue"
                                type="number"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                placeholder={
                                    selectDiscountType === "percentage"
                                        ? "50"
                                        : "3,000"
                                }
                                min={0}
                                max={
                                    selectDiscountType === "percentage"
                                        ? 100
                                        : 1000000
                                }
                                value={discountValue}
                                onChange={handleDiscountValueChange}
                                required
                            />
                        </div>
                    </div>

                    {/* 기간 설정 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                시작일 *
                            </label>
                            <input
                                name="startAt"
                                type="datetime-local"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                required
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                종료일 *
                            </label>
                            <input
                                name="endAt"
                                type="datetime-local"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                required
                            />
                        </div>
                    </div>

                    {/* 사용 제한 설정 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                유저당 사용 횟수 *
                            </label>
                            <input
                                name="maxUsagePerUser"
                                type="number"
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                placeholder="0"
                                defaultValue="1"
                                min="1"
                                required
                            />
                        </div>
                        {selectType === "event" && (
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    최대 사용 횟수 (선착순 이벤트)
                                </label>
                                <input
                                    name="maxUsage"
                                    type="number"
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                                    placeholder="무제한"
                                    min="1"
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="mt-2 flex items-center gap-4">
                            <label className="flex items-center">
                                <input
                                    name="isActive"
                                    type="checkbox"
                                    defaultChecked
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">
                                    활성 상태
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 border-t pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                        >
                            생성
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CouponCreateModal;
