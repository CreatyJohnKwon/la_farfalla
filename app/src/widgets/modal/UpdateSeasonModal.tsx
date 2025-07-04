import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    useSeasonQuery,
    useCreateSeasonMutation,
    useUpdateSeasonMutation,
    useDeleteSeasonMutation,
} from "../../shared/hooks/react-query/useSeasonQuery"; // 경로는 실제 위치에 맞게 조정
import { Season } from "@/src/entities/type/interfaces";

const UpdateSeasonModal = ({ onClose }: { onClose: () => void }) => {
    const [newSeason, setNewSeason] = useState({ title: "", year: "" });
    const [isAdding, setIsAdding] = useState(false);
    const [editingSeason, setEditingSeason] = useState<Season | null>(null);
    const [duplicateError, setDuplicateError] = useState("");

    // React Query 훅들
    const { data: seasons = [], isLoading, error } = useSeasonQuery();
    const createMutation = useCreateSeasonMutation();
    const updateMutation = useUpdateSeasonMutation();
    const deleteMutation = useDeleteSeasonMutation();

    // 중복 시즌 확인 함수 (편집 중인 시즌 제외)
    const isDuplicateSeason = (title: string, excludeId?: string) => {
        return seasons.some(
            (s) =>
                s.title.toLowerCase().trim() === title.toLowerCase().trim() &&
                s._id !== excludeId,
        );
    };

    // 시즌 추가
    const handleAddSeason = async () => {
        const trimmedTitle = newSeason.title.trim();
        const trimmedYear = newSeason.year.trim();

        // 빈 값 검증
        if (!trimmedTitle || !trimmedYear) {
            setDuplicateError("시즌명과 연도를 모두 입력해주세요.");
            return;
        }

        // 중복 검증
        if (isDuplicateSeason(trimmedTitle)) {
            setDuplicateError("이미 동일한 시즌명이 존재합니다.");
            return;
        }

        try {
            await createMutation.mutateAsync({
                title: trimmedTitle,
                year: trimmedYear,
            });

            setNewSeason({ title: "", year: "" });
            setIsAdding(false);
            setDuplicateError("");
        } catch (error: any) {
            setDuplicateError(error.message || "시즌 생성에 실패했습니다.");
        }
    };

    // 시즌 수정
    const handleUpdateSeason = async () => {
        if (!editingSeason) return;

        const trimmedTitle = editingSeason.title.trim();
        const trimmedYear = editingSeason.year.trim();

        // 빈 값 검증
        if (!trimmedTitle || !trimmedYear) {
            setDuplicateError("시즌명과 연도를 모두 입력해주세요.");
            return;
        }

        // 중복 검증 (자신 제외)
        if (isDuplicateSeason(trimmedTitle, editingSeason._id)) {
            setDuplicateError("이미 동일한 시즌명이 존재합니다.");
            return;
        }

        try {
            await updateMutation.mutateAsync({
                _id: editingSeason._id,
                title: trimmedTitle,
                year: trimmedYear,
            });

            setEditingSeason(null);
            setDuplicateError("");
        } catch (error: any) {
            setDuplicateError(error.message || "시즌 수정에 실패했습니다.");
        }
    };

    // 시즌 삭제
    const handleDeleteSeason = async (id: string) => {
        if (window.confirm("정말로 이 시즌을 삭제하시겠습니까?")) {
            try {
                await deleteMutation.mutateAsync(id);
            } catch (error: any) {
                alert(error.message || "시즌 삭제에 실패했습니다.");
            }
        }
    };

    // 편집 시작
    const startEditing = (season: Season) => {
        setEditingSeason({ ...season });
        setIsAdding(false);
        setDuplicateError("");
    };

    // 편집 취소
    const cancelEditing = () => {
        setEditingSeason(null);
        setDuplicateError("");
    };

    // 입력값 변경 시 에러 메시지 초기화
    const handleInputChange = (field: "title" | "year", value: string) => {
        if (editingSeason) {
            setEditingSeason((prev) =>
                prev ? { ...prev, [field]: value } : null,
            );
        } else {
            setNewSeason((prev) => ({ ...prev, [field]: value }));
        }
        if (duplicateError) {
            setDuplicateError("");
        }
    };

    // 로딩 상태
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="rounded-md bg-white p-8">
                    <div className="text-center">로딩 중...</div>
                </div>
            </div>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="rounded-md bg-white p-8">
                    <div className="text-center text-red-600">
                        데이터를 불러오는데 실패했습니다.
                    </div>
                    <button
                        onClick={() => confirm("작성을 취소하시겠습니까?") && onClose()}
                        className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-white"
                    >
                        닫기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => confirm("작성을 취소하시겠습니까?") && onClose()}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-md bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        시즌 관리
                    </h2>
                    <button
                        onClick={() => confirm("작성을 취소하시겠습니까?") && onClose()}
                        className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                        <svg
                            className="h-5 w-5"
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

                {/* 시즌 추가 버튼 */}
                <div className="mb-6">
                    {!isAdding && !editingSeason ? (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            disabled={createMutation.isPending}
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
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            새 시즌 추가
                        </button>
                    ) : isAdding || editingSeason ? (
                        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        시즌명
                                    </label>
                                    <input
                                        type="text"
                                        value={
                                            editingSeason
                                                ? editingSeason.title
                                                : newSeason.title
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "title",
                                                e.target.value,
                                            )
                                        }
                                        className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                                            duplicateError
                                                ? "border-red-300 focus:border-red-500"
                                                : "border-gray-300 focus:border-gray-500"
                                        }`}
                                        placeholder="예: 25 S/S"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        연도
                                    </label>
                                    <input
                                        type="text"
                                        value={
                                            editingSeason
                                                ? editingSeason.year
                                                : newSeason.year
                                        }
                                        onChange={(e) =>
                                            handleInputChange(
                                                "year",
                                                e.target.value,
                                            )
                                        }
                                        className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none ${
                                            duplicateError
                                                ? "border-red-300 focus:border-red-500"
                                                : "border-gray-300 focus:border-gray-500"
                                        }`}
                                        placeholder="예: 23 / 24 / 25"
                                    />
                                </div>
                            </div>

                            {/* 에러 메시지 */}
                            {duplicateError && (
                                <div className="mb-4 rounded-md bg-red-50 p-3">
                                    <div className="flex items-center">
                                        <svg
                                            className="mr-2 h-4 w-4 text-red-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        <p className="text-sm text-red-600">
                                            {duplicateError}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    onClick={
                                        editingSeason
                                            ? handleUpdateSeason
                                            : handleAddSeason
                                    }
                                    disabled={
                                        createMutation.isPending ||
                                        updateMutation.isPending
                                    }
                                    className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {createMutation.isPending ||
                                    updateMutation.isPending
                                        ? "처리중..."
                                        : editingSeason
                                          ? "수정"
                                          : "추가"}
                                </button>
                                <button
                                    onClick={() => {
                                        if (editingSeason) {
                                            cancelEditing();
                                        } else {
                                            setIsAdding(false);
                                            setNewSeason({
                                                title: "",
                                                year: "",
                                            });
                                            setDuplicateError("");
                                        }
                                    }}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* 시즌 목록 */}
                <div className="mb-6">
                    <h3 className="mb-3 text-sm font-medium text-gray-700">
                        현재 시즌 목록
                    </h3>
                    <div className="space-y-2">
                        {seasons.length === 0 ? (
                            <div className="rounded-md border border-gray-200 bg-gray-50 p-8 text-center">
                                <p className="text-sm text-gray-500">
                                    등록된 시즌이 없습니다.
                                </p>
                            </div>
                        ) : (
                            seasons.map((seasonItem) => (
                                <div
                                    key={seasonItem._id}
                                    className={`flex items-center justify-between rounded-md border p-4 ${
                                        editingSeason?._id === seasonItem._id
                                            ? "border-blue-300 bg-blue-50"
                                            : "border-gray-200 bg-white hover:bg-gray-50"
                                    }`}
                                >
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            {seasonItem.title}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            {seasonItem.year}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() =>
                                                startEditing(seasonItem)
                                            }
                                            disabled={
                                                editingSeason?._id ===
                                                seasonItem._id
                                            }
                                            className="rounded-md p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
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
                                                    strokeWidth={2}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDeleteSeason(
                                                    seasonItem._id,
                                                )
                                            }
                                            disabled={deleteMutation.isPending}
                                            className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
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
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 푸터 버튼 */}
                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                    <button
                        onClick={() => confirm("작성을 취소하시겠습니까?") && onClose()}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        닫기
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default UpdateSeasonModal;
