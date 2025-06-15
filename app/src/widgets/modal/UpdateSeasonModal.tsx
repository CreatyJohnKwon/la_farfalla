import { useState } from "react";
import { motion } from "framer-motion";

// 시즌 인터페이스
interface Season {
    _id: string;
    title: string;
    year: string;
}

const SeasonManagementModal = ({
    onClose,
    season,
}: {
    onClose: () => void;
    season: Season[];
}) => {
    const [seasons, setSeasons] = useState<Season[]>(season);
    const [newSeason, setNewSeason] = useState({ title: "", year: "" });
    const [isAdding, setIsAdding] = useState(false);

    // 시즌 추가
    const handleAddSeason = () => {
        if (newSeason.title.trim() && newSeason.year.trim()) {
            const newSeasonData: Season = {
                _id: Date.now().toString(), // 임시 ID 생성
                title: newSeason.title.trim(),
                year: newSeason.year.trim(),
            };
            setSeasons([...seasons, newSeasonData]);
            setNewSeason({ title: "", year: "" });
            setIsAdding(false);
        }
    };

    // 시즌 삭제
    const handleDeleteSeason = (id: string) => {
        if (window.confirm("정말로 이 시즌을 삭제하시겠습니까?")) {
            setSeasons(seasons.filter((s) => s._id !== id));
        }
    };

    // 저장 및 닫기
    const handleSave = () => {
        // 여기서 실제 API 호출 또는 상위 컴포넌트로 데이터 전달
        console.log("저장된 시즌 데이터:", seasons);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="mb-6 flex items-center justify-between border-b border-gray-200 pb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        시즌 관리
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
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
                    {!isAdding ? (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
                    ) : (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                            <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        시즌명
                                    </label>
                                    <input
                                        type="text"
                                        value={newSeason.title}
                                        onChange={(e) =>
                                            setNewSeason((prev) => ({
                                                ...prev,
                                                title: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                                        placeholder="예: Spring/Summer"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">
                                        연도
                                    </label>
                                    <input
                                        type="text"
                                        value={newSeason.year}
                                        onChange={(e) =>
                                            setNewSeason((prev) => ({
                                                ...prev,
                                                year: e.target.value,
                                            }))
                                        }
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                                        placeholder="예: 2024"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddSeason}
                                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                                >
                                    추가
                                </button>
                                <button
                                    onClick={() => {
                                        setIsAdding(false);
                                        setNewSeason({ title: "", year: "" });
                                    }}
                                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 시즌 목록 */}
                <div className="mb-6">
                    <h3 className="mb-3 text-sm font-medium text-gray-700">
                        현재 시즌 목록
                    </h3>
                    <div className="space-y-2">
                        {seasons.length === 0 ? (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
                                <p className="text-sm text-gray-500">
                                    등록된 시즌이 없습니다.
                                </p>
                            </div>
                        ) : (
                            seasons.map((seasonItem) => (
                                <div
                                    key={seasonItem._id}
                                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:bg-gray-50"
                                >
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            {seasonItem.title}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            {seasonItem.year}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            handleDeleteSeason(seasonItem._id)
                                        }
                                        className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
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
                            ))
                        )}
                    </div>
                </div>

                {/* 푸터 버튼 */}
                <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
                    <button
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                        저장
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default SeasonManagementModal;
