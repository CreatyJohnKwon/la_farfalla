import React, { useState } from "react";
import { ProductVariant } from "@src/components/product/interface";
import { OptionsProps } from "../../widgets/modal/interface";

const Options = ({
    variants,
    setVariants,
    newVariant,
    setNewVariant,
}: OptionsProps) => {
    // 🆕 인라인 편집을 위한 상태 추가
    const [editingVariantId, setEditingVariantId] = useState<string | null>(
        null,
    );
    const [editingVariant, setEditingVariant] = useState<{
        colorName: string;
        stockQuantity: number;
    } | null>(null);

    // 옵션 추가
    const addVariant = (): void => {
        if (!newVariant.colorName.trim()) {
            alert("색상명은 필수입니다.");
            return;
        }

        // 중복 체크 (색상만)
        const isDuplicate = variants.some(
            (v: ProductVariant) =>
                v.colorName.toLowerCase() ===
                newVariant.colorName.toLowerCase(),
        );

        if (isDuplicate) {
            alert("같은 색상이 이미 존재합니다.");
            return;
        }

        const variant: ProductVariant = {
            id: Date.now().toString(),
            colorName: newVariant.colorName.trim(),
            stockQuantity: newVariant.stockQuantity,
        };

        setVariants((prev: ProductVariant[]) => [...prev, variant]);

        // 폼 초기화
        setNewVariant({
            colorName: "",
            stockQuantity: 0,
        });
    };

    // 옵션 제거
    const removeVariant = (id: string): void => {
        if (confirm("이 옵션을 삭제하시겠습니까?")) {
            setVariants((prev: ProductVariant[]) =>
                prev.filter((v: ProductVariant) => v.id !== id),
            );
        }
    };

    // 🔧 인라인 편집 시작 (기존 editVariant 함수 수정)
    const editVariant = (variant: ProductVariant): void => {
        setEditingVariantId(variant.id);
        setEditingVariant({
            colorName: variant.colorName,
            stockQuantity: variant.stockQuantity,
        });
    };

    // 🆕 편집 저장 함수
    const saveEditVariant = (variantId: string): void => {
        if (!editingVariant?.colorName.trim()) {
            alert("색상명은 필수입니다.");
            return;
        }

        // 중복 체크 (현재 편집 중인 항목 제외)
        const isDuplicate = variants.some(
            (v: ProductVariant) =>
                v.id !== variantId &&
                v.colorName.toLowerCase() ===
                    editingVariant.colorName.toLowerCase(),
        );

        if (isDuplicate) {
            alert("같은 색상이 이미 존재합니다.");
            return;
        }

        setVariants((prev: ProductVariant[]) =>
            prev.map((v: ProductVariant) =>
                v.id === variantId
                    ? {
                          ...v,
                          colorName: editingVariant.colorName.trim(),
                          stockQuantity: editingVariant.stockQuantity,
                      }
                    : v,
            ),
        );

        // 편집 모드 해제
        setEditingVariantId(null);
        setEditingVariant(null);
    };

    // 🆕 편집 취소 함수
    const cancelEditVariant = (): void => {
        setEditingVariantId(null);
        setEditingVariant(null);
    };

    return (
        <div className="space-y-6">
            <label className="text-lg font-bold text-gray-900">
                색상 옵션 관리 *
            </label>

            {/* 옵션 추가 폼 */}
            <div className="border border-gray-300 bg-gray-50 p-6">
                <h4 className="mb-4 text-base font-bold text-gray-900">
                    새 색상 옵션 추가
                </h4>
                <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                            색상명
                        </label>
                        <input
                            type="text"
                            value={newVariant.colorName}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                                setNewVariant({
                                    ...newVariant,
                                    colorName: e.target.value,
                                })
                            }
                            className="w-full border border-gray-300 px-4 py-3 text-sm transition-colors hover:border-gray-400 focus:border-gray-500 focus:outline-none"
                            placeholder="예: black"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                            재고수량
                        </label>
                        <input
                            type="number"
                            value={newVariant.stockQuantity}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                                setNewVariant({
                                    ...newVariant,
                                    stockQuantity:
                                        parseInt(e.target.value) || 0,
                                })
                            }
                            className="w-full border border-gray-300 px-4 py-3 text-sm transition-colors hover:border-gray-400 focus:border-gray-500 focus:outline-none"
                            min="0"
                            placeholder="0"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={addVariant}
                        className="h-12 bg-gray-900 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-gray-700"
                    >
                        추가
                    </button>
                </div>
            </div>

            {/* 옵션 목록 테이블 */}
            {variants.length > 0 && (
                <div className="overflow-hidden border border-gray-200 bg-white">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <h4 className="text-base font-bold text-gray-900">
                            등록된 색상 옵션 ({variants.length}개)
                        </h4>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr className="border-b border-gray-200">
                                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">
                                        색상
                                    </th>
                                    <th className="px-4 py-4 text-center text-sm font-bold text-gray-700">
                                        재고수량
                                    </th>
                                    <th className="px-4 py-4 text-center text-sm font-bold text-gray-700">
                                        판매상태
                                    </th>
                                    <th className="px-4 py-4 text-center text-sm font-bold text-gray-700">
                                        관리
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {variants.map(
                                    (
                                        variant: ProductVariant,
                                        index: number,
                                    ) => (
                                        <tr
                                            key={variant.id}
                                            className={`transition-colors hover:bg-gray-50 ${
                                                index % 2 === 0
                                                    ? "bg-white"
                                                    : "bg-gray-50/50"
                                            } ${
                                                editingVariantId === variant.id
                                                    ? "bg-blue-50"
                                                    : ""
                                            }`}
                                        >
                                            {/* 🔧 색상 칸 - 편집 모드에 따라 다르게 렌더링 */}
                                            <td className="px-4 py-4">
                                                {editingVariantId ===
                                                variant.id ? (
                                                    <input
                                                        type="text"
                                                        value={
                                                            editingVariant?.colorName ||
                                                            ""
                                                        }
                                                        onChange={(
                                                            e: React.ChangeEvent<HTMLInputElement>,
                                                        ) =>
                                                            setEditingVariant({
                                                                ...editingVariant!,
                                                                colorName:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="w-full border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                                                        placeholder="색상명"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className="text-sm font-semibold text-gray-800">
                                                        {variant.colorName}
                                                    </span>
                                                )}
                                            </td>

                                            {/* 🔧 재고수량 칸 - 편집 모드에 따라 다르게 렌더링 */}
                                            <td className="px-4 py-4 text-center">
                                                {editingVariantId ===
                                                variant.id ? (
                                                    <input
                                                        type="number"
                                                        value={
                                                            editingVariant?.stockQuantity ||
                                                            0
                                                        }
                                                        onChange={(
                                                            e: React.ChangeEvent<HTMLInputElement>,
                                                        ) =>
                                                            setEditingVariant({
                                                                ...editingVariant!,
                                                                stockQuantity:
                                                                    parseInt(
                                                                        e.target
                                                                            .value,
                                                                    ) || 0,
                                                            })
                                                        }
                                                        className="w-20 border border-gray-300 px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none"
                                                        min="0"
                                                    />
                                                ) : (
                                                    <span
                                                        className={`inline-block px-3 py-1 text-sm font-bold ${
                                                            variant.stockQuantity ===
                                                            0
                                                                ? "bg-gray-800 text-white"
                                                                : variant.stockQuantity <
                                                                    10
                                                                  ? "bg-gray-600 text-white"
                                                                  : "bg-gray-400 text-white"
                                                        }`}
                                                    >
                                                        {variant.stockQuantity}
                                                        개
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-4 text-center">
                                                <span
                                                    className={`inline-block px-3 py-1 text-sm font-bold ${
                                                        (editingVariantId ===
                                                        variant.id
                                                            ? editingVariant?.stockQuantity
                                                            : variant.stockQuantity) ===
                                                        0
                                                            ? "bg-gray-800 text-white"
                                                            : "bg-gray-400 text-white"
                                                    }`}
                                                >
                                                    {(editingVariantId ===
                                                    variant.id
                                                        ? editingVariant?.stockQuantity
                                                        : variant.stockQuantity) ===
                                                    0
                                                        ? "품절"
                                                        : "판매중"}
                                                </span>
                                            </td>

                                            {/* 🔧 관리 버튼 - 편집 모드에 따라 다르게 렌더링 */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {editingVariantId ===
                                                    variant.id ? (
                                                        // 편집 모드일 때: 저장/취소 버튼
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    saveEditVariant(
                                                                        variant.id,
                                                                    )
                                                                }
                                                                className="p-2 text-green-600 transition-colors hover:bg-green-100 hover:text-green-700"
                                                                title="저장"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M5 13l4 4L19 7"
                                                                    />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={
                                                                    cancelEditVariant
                                                                }
                                                                className="p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-700"
                                                                title="취소"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M6 18L18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    ) : (
                                                        // 일반 모드일 때: 수정/삭제 버튼
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    editVariant(
                                                                        variant,
                                                                    )
                                                                }
                                                                className="p-2 text-blue-600 transition-colors hover:bg-blue-100 hover:text-blue-700"
                                                                title="수정"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                                    />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeVariant(
                                                                        variant.id,
                                                                    )
                                                                }
                                                                className="p-2 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
                                                                title="삭제"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ),
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">
                                총 {variants.length}개 색상 옵션
                            </span>
                            <span className="text-sm text-gray-600">
                                총 재고:{" "}
                                {variants.reduce(
                                    (sum: number, v: ProductVariant) => {
                                        // 편집 중인 항목은 editingVariant 값 사용
                                        if (
                                            editingVariantId === v.id &&
                                            editingVariant
                                        ) {
                                            return (
                                                sum +
                                                editingVariant.stockQuantity
                                            );
                                        }
                                        return sum + v.stockQuantity;
                                    },
                                    0,
                                )}
                                개
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {variants.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 bg-gray-50 py-12 text-center">
                    <div className="mx-auto max-w-sm space-y-4">
                        <div className="text-4xl text-gray-400">+</div>
                        <div className="space-y-2">
                            <div className="text-lg font-semibold text-gray-600">
                                아직 등록된 색상 옵션이 없습니다
                            </div>
                            <div className="text-sm text-gray-500">
                                위 폼을 사용하여 색상 옵션을 추가해주세요
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Options;
