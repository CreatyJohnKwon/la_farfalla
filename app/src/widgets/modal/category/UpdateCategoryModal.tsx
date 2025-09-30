"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, Reorder } from "framer-motion";
import {
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} from "@src/shared/hooks/react-query/useCategoryQuery";
import type { 
    Category,
    CreateCategoryData
} from "@/src/entities/type/common";
import useProduct from "@src/shared/hooks/useProduct";
import ModalWrap from "../etc/ModalWrap";

const UpdateCategoryModal = ({ onClose }: { onClose: () => void }) => {
    const initialState: CreateCategoryData = { name: "", description: "", displayOrder: 0 };
    const [newCategory, setNewCategory] = useState(initialState);
    const [isAdding, setIsAdding] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [clientError, setClientError] = useState("");
    const [orderedCategories, setOrderedCategories] = useState<Category[]>([]);

    const { category, categoryLoading, categoryError, useRefetchProducts} = useProduct();
    const createMutation = useCreateCategoryMutation();
    const updateMutation = useUpdateCategoryMutation();
    const deleteMutation = useDeleteCategoryMutation();

    const sortedCategories = useMemo(() => {
        if (!category) return [];
        return [...category].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    }, [category]);

    useEffect(() => {
        setOrderedCategories(sortedCategories);
    }, [sortedCategories]);

    const isDuplicateName = (name: string, excludeId?: string) => {
        if (!category) return null;
        return category.some(
            (c) =>
                c.name.toLowerCase().trim() === name.toLowerCase().trim() &&
                c._id !== excludeId,
        );
    };

    const handleAddCategory = () => {
        const trimmedName = newCategory.name.trim();
        if (!trimmedName) {
            setClientError("카테고리명은 필수입니다.");
            return;
        }
        if (isDuplicateName(trimmedName)) {
            setClientError("이미 동일한 카테고리명이 존재합니다.");
            return;
        }

        createMutation.mutate(
            { ...newCategory, name: trimmedName },
            {
                onSuccess: () => {
                    setNewCategory(initialState);
                    setIsAdding(false);
                    setClientError("");
                    useRefetchProducts();
                },
                onError: (error: any) => {
                    setClientError(error.message || "카테고리 생성에 실패했습니다.");
                }
            }
        );
    };

    const handleUpdateCategory = () => {
        if (!editingCategory) return;
        const trimmedName = editingCategory.name.trim();
        if (!trimmedName) {
            setClientError("카테고리명은 필수입니다.");
            return;
        }
        if (isDuplicateName(trimmedName, editingCategory._id)) {
            setClientError("이미 동일한 카테고리명이 존재합니다.");
            return;
        }
        
        updateMutation.mutate(
            {
                _id: editingCategory._id,
                name: trimmedName,
                description: editingCategory.description,
                displayOrder: editingCategory.displayOrder,
            },
            {
                onSuccess: () => {
                    setEditingCategory(null);
                    setClientError("");
                    useRefetchProducts();
                },
                onError: (error: any) => {
                     setClientError(error.message || "카테고리 수정에 실패했습니다.");
                }
            }
        );
    };

    const handleDeleteCategory = (id: string) => {
        if (window.confirm("정말로 이 카테고리를 삭제하시겠습니까?\n연결된 모든 상품에서 카테고리 정보가 사라집니다.")) {
            deleteMutation.mutate(id, {
                onSuccess: () => {
                    if (editingCategory?._id === id) {
                        setEditingCategory(null);
                    }
                    alert("카테고리가 성공적으로 삭제되었습니다.");
                    setClientError("");
                    useRefetchProducts();
                },
                onError: (error: any) => {
                    alert(error.message || "카테고리 삭제에 실패했습니다.");
                }
            });
        }
    };

    const startEditing = (category: Category) => {
        setEditingCategory({ ...category });
        setIsAdding(false);
        setClientError("");
    };

    const cancelEditing = () => {
        setEditingCategory(null);
        setClientError("");
    };
    
    const cancelAdding = () => {
        setIsAdding(false);
        setNewCategory(initialState);
        setClientError("");
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const isNumericField = name === 'displayOrder';
        const parsedValue = isNumericField ? (value === '' ? '' : Number(value)) : value;

        const targetState = editingCategory ? setEditingCategory : setNewCategory;
        targetState((prev: any) => (prev ? { ...prev, [name]: parsedValue } : null));
        
        if (clientError) setClientError("");
    };

    const handleSaveOrder = () => {
        // 현재 순서(orderedCategories)와 원본 순서(sortedCategories)를 비교하여
        // 변경된 항목만 찾아서 업데이트 뮤테이션을 실행합니다.
        const updatePromises = orderedCategories.map((category, index) => {
            // 새로운 displayOrder는 배열의 인덱스입니다.
            const newDisplayOrder = index;

            // 기존 displayOrder와 다를 경우에만 업데이트
            if (category.displayOrder !== newDisplayOrder) {
                return updateMutation.mutateAsync({ 
                    ...category, 
                    displayOrder: newDisplayOrder 
                });
            }
            return Promise.resolve(); // 변경되지 않았으면 아무것도 하지 않음
        });

        Promise.all(updatePromises)
            .then(() => {
                alert("카테고리 순서가 성공적으로 저장되었습니다.");
            })
            .catch((err) => {
                console.error("순서 저장 중 오류 발생:", err);
                alert("순서 저장에 실패했습니다. 다시 시도해주세요.");
            });
    };
    
    // 로딩 및 에러 상태 UI
    if (!category || categoryLoading || categoryError) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="rounded-sm bg-white p-8 text-center shadow-xl">
                    {!category || categoryLoading ? "데이터를 불러오는 중..." : "오류가 발생했습니다."}
                    {categoryError && <button onClick={onClose} className="mt-4 rounded bg-gray-200 px-4 py-2">닫기</button>}
                </div>
            </div>
        );
    }
    
    return (
        <ModalWrap
            onClose={onClose}
            className="relative flex h-full max-h-[90vh] w-full max-w-2xl flex-col rounded-sm bg-white"
        >
            {/* 헤더 */}
            <header className="flex items-center justify-between border-b border-gray-200 p-6 font-pretendard">
                <h2 className="text-xl font-pretendard-bold font-[600] text-gray-800">카테고리 관리</h2>
                <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </header>

            {/* 컨텐츠 영역 */}
            <main className="flex-1 overflow-y-auto p-6 font-pretendard">
                {/* 카테고리 추가 UI */}
                <div className="mb-6">
                    {!isAdding && !editingCategory ? (
                        <button onClick={() => setIsAdding(true)} className="flex w-full items-center justify-center gap-2 rounded-sm border-2 border-dashed border-gray-300 py-4 text-gray-500 transition hover:border-gray-400 hover:text-gray-700 font-pretendard">
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            새 카테고리 추가
                        </button>
                    ) : (
                        <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-4">
                            <h3 className="mb-4 text-lg font-pretendard font-[500] text-gray-800">{editingCategory ? "카테고리 수정" : "새 카테고리"}</h3>
                            <div className="space-y-4">
                                <div className="sm:col-span-2">
                                    <label htmlFor="name" className="mb-1 block text-sm text-gray-700">카테고리명 <span className="text-red-500">*</span></label>
                                    {editingCategory?.name !== "MVP" 
                                        ? <input type="text" id="name" name="name" value={editingCategory?.name ?? newCategory.name} onChange={handleInputChange} placeholder="예: 상의" className="w-full border-gray-300 focus:border-gray-500 focus:ring-gray-500 sm:text-sm" />
                                        : <span>{editingCategory?.name}</span>
                                    }
                                </div>
                                <div>
                                    <label htmlFor="description" className="mb-1 block text-sm text-gray-700">설명 (선택)</label>
                                    <textarea id="description" name="description" value={editingCategory?.description ?? newCategory.description} onChange={handleInputChange} placeholder="카테고리에 대한 간단한 설명 (고객에게 노출되지 않음)" rows={2} className="w-full border-gray-300 focus:border-gray-500 focus:ring-gray-500 sm:text-sm" />
                                </div>
                            </div>
                            {clientError && <p className="mt-3 text-sm text-red-600">{clientError}</p>}
                            <div className="mt-4 flex gap-2">
                                <button onClick={editingCategory ? handleUpdateCategory : handleAddCategory} disabled={createMutation.isPending || updateMutation.isPending} className="bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50">
                                    {createMutation.isPending || updateMutation.isPending ? "저장 중..." : (editingCategory ? "수정 완료" : "추가하기")}
                                </button>
                                <button onClick={editingCategory ? cancelEditing : cancelAdding} className="border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">취소</button>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* 카테고리 목록 */}
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-base font-pretendard-bold font-[600] text-gray-600">
                            현재 카테고리 목록
                        </h3>
                        {/* ⬇️ 순서 저장 버튼 추가 ⬇️ */}
                        <button 
                            onClick={handleSaveOrder}
                            disabled={updateMutation.isPending}
                            className="bg-gray-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-900 disabled:opacity-50"
                        >
                            {updateMutation.isPending ? "저장 중..." : "순서 저장"}
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 -mt-2">
                        항목을 드래그하여 순서를 변경한 후 '순서 저장' 버튼을 눌러주세요.
                    </p>

                    <div className="space-y-2">
                        {orderedCategories.length === 0 ? (
                            <div className="py-8 text-center text-sm text-gray-500">
                                등록된 카테고리가 없습니다.
                            </div>
                        ) : (
                            // ⬇️ Reorder.Group으로 기존 map을 감쌉니다 ⬇️
                            <Reorder.Group axis="y" values={orderedCategories} onReorder={setOrderedCategories}>
                                {orderedCategories.map((categoryItem) => (
                                    // ⬇️ div를 Reorder.Item으로 변경합니다 ⬇️
                                    <Reorder.Item key={categoryItem._id} value={categoryItem}>
                                        <div className={`flex items-center justify-between rounded-sm border p-3 transition-all ${editingCategory?._id === categoryItem._id ? "bg-blue-50 ring-1 ring-indigo-200" : "border-gray-200 bg-white"}`}>
                                            <div className="flex items-center gap-5">
                                                {/* ⬇️ 드래그 핸들 아이콘 추가 ⬇️ */}
                                                <div className="cursor-grab text-gray-400 touch-none">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <circle cx="12" cy="5" r="1"></circle>
                                                        <circle cx="12" cy="12" r="1"></circle>
                                                        <circle cx="12" cy="19" r="1"></circle>
                                                        <circle cx="5" cy="5" r="1"></circle>
                                                        <circle cx="5" cy="12" r="1"></circle>
                                                        <circle cx="5" cy="19" r="1"></circle>
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h4 className="font-pretendard font-[500] text-gray-800">{categoryItem.name}</h4>
                                                    {categoryItem.description && <p className="text-sm text-gray-500">{categoryItem.description}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => startEditing(categoryItem)} disabled={!!editingCategory} className="p-2 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40">
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                                                </button>
                                                {categoryItem.name !== "MVP" &&
                                                    <button onClick={() => handleDeleteCategory(categoryItem._id)} disabled={deleteMutation.isPending || !!editingCategory} className="p-2 text-gray-400 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40">
                                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                }
                                            </div>
                                        </div>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        )}
                    </div>
                </div>
            </main>
        </ModalWrap>
    );
};

export default UpdateCategoryModal;