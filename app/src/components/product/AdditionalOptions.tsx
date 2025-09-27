import { AdditionalOption } from '@src/entities/type/products';
import React, { useState } from 'react';

interface AdditionalOptionsProps {
    additionalOptions: AdditionalOption[];
    setAdditionalOptions: React.Dispatch<React.SetStateAction<AdditionalOption[]>>;
    newAdditionalOption: { name: string; additionalPrice: number; stockQuantity: number; };
    setNewAdditionalOption: React.Dispatch<React.SetStateAction<{ name: string; additionalPrice: number; stockQuantity: number; }>>;
}

const AdditionalOptions = ({
    additionalOptions,
    setAdditionalOptions,
    newAdditionalOption,
    setNewAdditionalOption,
}: AdditionalOptionsProps) => {
    const [editingOptionId, setEditingOptionId] = useState<string | null>(null);
    const [editingOption, setEditingOption] = useState<Omit<AdditionalOption, 'id'> | null>(null);

    const addOption = (): void => {
        if (!newAdditionalOption.name.trim()) {
            alert("추가 옵션명은 필수입니다.");
            return;
        }

        const newOption: AdditionalOption = {
            id: Date.now().toString(),
            name: newAdditionalOption.name.trim(),
            additionalPrice: newAdditionalOption.additionalPrice || 0,
            stockQuantity: newAdditionalOption.stockQuantity || 0,
        };

        setAdditionalOptions((prev) => [...prev, newOption]);
        setNewAdditionalOption({ name: "", additionalPrice: 0, stockQuantity: 0 });
    };

    // 옵션 제거
    const removeOption = (id: string): void => {
        if (confirm("이 추가 옵션을 삭제하시겠습니까?")) {
            setAdditionalOptions((prev) => prev.filter((opt) => opt.id !== id));
        }
    };

    // 인라인 편집 시작
    const editOption = (option: AdditionalOption): void => {
        setEditingOptionId(option.id);
        setEditingOption({
            name: option.name,
            additionalPrice: option.additionalPrice,
            stockQuantity: option.stockQuantity,
        });
    };

    // 편집 저장
    const saveEditOption = (optionId: string): void => {
        if (!editingOption?.name.trim()) {
            alert("추가 옵션명은 필수입니다.");
            return;
        }

        const isDuplicate = additionalOptions.some(
            (opt) => opt.id !== optionId && opt.name.toLowerCase() === editingOption.name.toLowerCase()
        );

        if (isDuplicate) {
            alert("같은 이름의 추가 옵션이 이미 존재합니다.");
            return;
        }

        setAdditionalOptions((prev) =>
            prev.map((opt) =>
                opt.id === optionId && editingOption
                    ? {
                          ...opt,
                          name: editingOption.name.trim(),
                          additionalPrice: editingOption.additionalPrice || 0,
                          stockQuantity: editingOption.stockQuantity || 0,
                      }
                    : opt
            )
        );

        setEditingOptionId(null);
        setEditingOption(null);
    };

    // 편집 취소
    const cancelEditOption = (): void => {
        setEditingOptionId(null);
        setEditingOption(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        addOption();
    };

    return (
        <div className="space-y-6 border-t border-dashed border-black/50 pt-5">
            <label className="text-lg font-bold text-gray-900">
                추가 옵션 관리
            </label>

            {/* 옵션 추가 폼 */}
            <div onKeyDown={handleKeyDown}>
                <h4 className="mb-4 text-base font-bold text-gray-900">
                    새 추가 옵션 생성 (선택)
                </h4>
                <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">옵션명</label>
                        <input
                            type="text"
                            value={newAdditionalOption.name}
                            onChange={(e) => setNewAdditionalOption({ ...newAdditionalOption, name: e.target.value })}
                            className="w-full border border-gray-300 px-4 py-3 text-sm transition-colors hover:border-gray-400 focus:border-gray-500 focus:outline-none"
                            placeholder="예: 선물 포장"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">추가 금액 (선택)</label>
                        <input
                            type="text"
                            value={newAdditionalOption.additionalPrice}
                            onChange={(e) => setNewAdditionalOption({ ...newAdditionalOption, additionalPrice: parseInt(e.target.value) || 0 })}
                            className="w-full border border-gray-300 px-4 py-3 text-sm transition-colors hover:border-gray-400 focus:border-gray-500 focus:outline-none"
                            placeholder="금액"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">재고</label>
                        <input
                            type="text"
                            value={newAdditionalOption.stockQuantity}
                            onChange={(e) => setNewAdditionalOption({ ...newAdditionalOption, stockQuantity: parseInt(e.target.value) || 0 })}
                            className="w-full border border-gray-300 px-4 py-3 text-sm transition-colors hover:border-gray-400 focus:border-gray-500 focus:outline-none"
                            placeholder="재고"
                        />
                    </div>
                </div>
                <button
                    type="button"
                    onClick={addOption}
                    className="h-12 bg-gray-900 px-6 py-3 mt-4 text-sm font-bold text-white transition-colors hover:bg-gray-700 w-full"
                >
                    추가
                </button>
            </div>

            {/* 옵션 목록 테이블 */}
            {additionalOptions.length > 0 && (
                <div className="overflow-hidden border border-gray-200 bg-white">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <h4 className="text-base font-bold text-gray-900">
                            등록된 추가 옵션 ({additionalOptions.length}개)
                        </h4>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr className="border-b border-gray-200">
                                    <th className="px-4 py-4 text-left text-sm font-bold text-gray-700">옵션명</th>
                                    <th className="px-4 py-4 text-center text-sm font-bold text-gray-700">추가 금액</th>
                                    <th className="px-4 py-4 text-center text-sm font-bold text-gray-700">재고</th>
                                    <th className="px-4 py-4 text-center text-sm font-bold text-gray-700">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {additionalOptions.map((option, index) => (
                                    <tr 
                                        key={option.id} 
                                        className={`transition-colors hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} ${editingOptionId === option.id ? "bg-blue-50" : ""}`}
                                        onKeyDown={(e) => {
                                            if (e.key !== 'Enter') return;
                                            e.preventDefault();
                                            saveEditOption(option?.id)
                                        }}
                                    >
                                        <td className="px-4 py-4">
                                            {editingOptionId === option.id ? (
                                                <input
                                                    type="text"
                                                    value={editingOption?.name || ""}
                                                    onChange={(e) => setEditingOption({ ...editingOption!, name: e.target.value })}
                                                    className="w-full border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                                                    placeholder="옵션명"
                                                    autoFocus
                                                />
                                            ) : (
                                                <span className="text-sm font-semibold text-gray-800">{option.name}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {editingOptionId === option.id ? (
                                                <input
                                                    type="text"
                                                    value={editingOption?.additionalPrice || 0}
                                                    onChange={(e) => setEditingOption({ ...editingOption!, additionalPrice: parseInt(e.target.value) || 0 })}
                                                    className="w-24 border border-gray-300 px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none"
                                                    placeholder='금액'
                                                />
                                            ) : (
                                                <span className="text-sm text-gray-600">
                                                    {option.additionalPrice ? `+${option.additionalPrice.toLocaleString()}원` : "-"}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {editingOptionId === option.id ? (
                                                <input
                                                    type="text"
                                                    value={editingOption?.stockQuantity || 0}
                                                    onChange={(e) => setEditingOption({ ...editingOption!, stockQuantity: parseInt(e.target.value) || 0 })}
                                                    className="w-24 border border-gray-300 px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none"
                                                    placeholder='재고'
                                                />
                                            ) : (
                                                <span className={`text-sm font-bold ${option.stockQuantity === 0 ? "text-red-500" : "text-gray-600"}`}>
                                                    {option.stockQuantity}개
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                {editingOptionId === option.id ? (
                                                    <>
                                                        <button type="button" onClick={() => saveEditOption(option?.id)} className="p-2 text-green-600 transition-colors hover:bg-green-100" title="저장">
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                        </button>
                                                        <button type="button" onClick={cancelEditOption} className="p-2 text-gray-600 transition-colors hover:bg-gray-100" title="취소">
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button type="button" onClick={() => editOption(option)} className="p-2 text-blue-600 transition-colors hover:bg-blue-100" title="수정">
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                        </button>
                                                        <button type="button" onClick={() => removeOption(option.id)} className="p-2 text-red-600 transition-colors hover:bg-red-100" title="삭제">
                                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {additionalOptions.length === 0 && (
                <div className="border-2 border-dashed border-gray-300 bg-gray-50 py-12 text-center">
                    <div className="mx-auto max-w-sm space-y-4">
                        <div className="text-4xl text-gray-400">+</div>
                        <div className="space-y-2">
                            <div className="text-lg font-semibold text-gray-600">
                                아직 등록된 추가 옵션이 없습니다
                            </div>
                            <div className="text-sm text-gray-500">
                                위 폼을 사용하여 추가 옵션을 등록해주세요
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdditionalOptions;