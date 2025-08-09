import { useState } from "react";
import { IAnnounceDTO } from "@/src/entities/type/announce";
import {
    useDeleteAnnounceMutation,
    useUpdateAnnounceMutation,
} from "@/src/shared/hooks/react-query/useAnnounce";
import LoadingSpinner from "../../spinner/LoadingSpinner";
import ImageViewerModal from "../ImageViewerModal";
import Image from "next/image";

interface AnnounceListProps {
    announces?: IAnnounceDTO[];
    onEdit?: (announce: IAnnounceDTO) => void;
}

const AnnounceList = ({ announces, onEdit }: AnnounceListProps) => {
    const { mutate: deleteAnnounce, isPending: isDeleting } =
        useDeleteAnnounceMutation();
    const { mutate: updateAnnounce, isPending: isUpdating } =
        useUpdateAnnounceMutation();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [imageElement, setImageElement] = useState<string | null>(null);
    const [imageModalOpen, setImageModalOpen] = useState<boolean>(false);

    const handleDelete = async (id: string) => {
        if (confirm("정말 삭제하시겠습니까?")) {
            setDeletingId(id);
            deleteAnnounce(id, {
                onSettled: () => {
                    setDeletingId(null);
                },
            });
        }
    };

    const handleToggleVisible = (announce: IAnnounceDTO) => {
        setTogglingId(announce._id.toString());
        updateAnnounce(
            {
                id: announce._id.toString(),
                data: { visible: !announce.visible },
            },
            {
                onSettled: () => {
                    setTogglingId(null);
                },
            },
        );
    };

    const formatDate = (date: string | Date) => {
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatus = (announce: IAnnounceDTO) => {
        const now = new Date();
        const startDate = new Date(announce.startAt);
        const endDate = new Date(announce.deletedAt);

        if (!announce.visible) {
            return {
                label: "숨김",
                color: "bg-gray-100 text-gray-600",
                dotColor: "bg-gray-400",
            };
        }

        if (now < startDate) {
            return {
                label: "예정",
                color: "bg-orange-100 text-orange-700",
                dotColor: "bg-orange-400",
            };
        } else if (now > endDate) {
            return {
                label: "종료",
                color: "bg-gray-100 text-gray-600",
                dotColor: "bg-gray-400",
            };
        } else {
            return {
                label: "진행중",
                color: "bg-blue-100 text-blue-700",
                dotColor: "bg-blue-500",
            };
        }
    };

    // 이미지 URL 여부 확인 함수
    const isImageUrl = (description: string) => {
        return (
            description.startsWith("http") &&
            (description.includes(".jpg") ||
                description.includes(".jpeg") ||
                description.includes(".png") ||
                description.includes(".gif") ||
                description.includes("r2.dev"))
        ); // R2 도메인 체크
    };

    // 이미지 클릭 핸들러
    const handleImageClick = (imageUrl: string) => {
        setImageElement(imageUrl);
        setImageModalOpen(true);
    };

    if (!announces || announces.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 bg-gray-100 p-4">
                    <svg
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-5 5v-5zM11 17H6a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v6.5M11 7h6M11 11h4"
                        />
                    </svg>
                </div>
                <p className="font-medium text-gray-600">
                    등록된 공지가 없습니다
                </p>
                <p className="mt-1 text-sm text-gray-400">
                    새로운 공지를 작성해보세요
                </p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                {announces.map((announce: IAnnounceDTO) => {
                    const isCurrentlyDeleting =
                        isDeleting && deletingId === announce._id.toString();
                    const isCurrentlyToggling =
                        isUpdating && togglingId === announce._id.toString();
                    const status = getStatus(announce);
                    const isPopupImage =
                        announce.isPopup && isImageUrl(announce.description);

                    return (
                        <div
                            key={announce._id.toString()}
                            className={`group relative border-b border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm sm:p-6 ${
                                isCurrentlyDeleting ? "opacity-50" : ""
                            } ${!announce.visible ? "bg-gray-50" : ""}`}
                        >
                            {/* 상단: 타입 배지와 상태, 액션 버튼들 */}
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* 공지 타입 배지 */}
                                    <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium ${
                                            announce.isPopup
                                                ? "bg-purple-100 text-purple-700"
                                                : "bg-blue-100 text-blue-700"
                                        }`}
                                    >
                                        {announce.isPopup ? (
                                            <>
                                                <svg
                                                    className="h-3 w-3"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                                </svg>
                                                팝업
                                            </>
                                        ) : (
                                            <>
                                                <svg
                                                    className="h-3 w-3"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V8z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                배너
                                            </>
                                        )}
                                    </span>

                                    {/* 상태 배지 */}
                                    <span
                                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium ${status.color}`}
                                    >
                                        <div
                                            className={`h-2 w-2 ${status.dotColor}`}
                                        ></div>
                                        {status.label}
                                    </span>
                                </div>

                                {/* 액션 버튼들 */}
                                <div className="flex items-center gap-1">
                                    {/* 수정 버튼 */}
                                    {onEdit && (
                                        <button
                                            onClick={() => onEdit(announce)}
                                            disabled={isUpdating || isDeleting}
                                            className="flex h-8 w-8 items-center justify-center text-gray-400 transition-all hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                            aria-label={`${announce.description} 공지 수정`}
                                            title="수정"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                        </button>
                                    )}

                                    {/* 표시/숨김 토글 버튼 */}
                                    <button
                                        onClick={() =>
                                            handleToggleVisible(announce)
                                        }
                                        disabled={isUpdating || isDeleting}
                                        className={`flex h-8 w-8 items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
                                            announce.visible
                                                ? "text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:ring-gray-500"
                                                : "text-orange-600 hover:bg-orange-50 hover:text-orange-700 focus:ring-orange-500"
                                        }`}
                                        aria-label={
                                            announce.visible
                                                ? "공지 숨기기"
                                                : "공지 표시하기"
                                        }
                                        title={
                                            announce.visible
                                                ? "숨기기"
                                                : "표시하기"
                                        }
                                    >
                                        {isCurrentlyToggling ? (
                                            <LoadingSpinner size="md" />
                                        ) : announce.visible ? (
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        ) : (
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L12 12m-2.122-2.122L7.76 7.76m6.362 6.362L17.24 17.24M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                                />
                                            </svg>
                                        )}
                                    </button>

                                    {/* 삭제 버튼 */}
                                    <button
                                        onClick={() =>
                                            handleDelete(
                                                announce._id.toString(),
                                            )
                                        }
                                        disabled={isDeleting || isUpdating}
                                        className="flex h-8 w-8 items-center justify-center text-gray-400 transition-all hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
                                        aria-label={`${announce.description} 공지 삭제`}
                                        title="삭제"
                                    >
                                        {isCurrentlyDeleting ? (
                                            <div className="h-4 w-4 animate-spin border-2 border-red-600 border-t-transparent"></div>
                                        ) : (
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* 공지 내용 */}
                            <div className="mb-4">
                                {isPopupImage ? (
                                    <div className="space-y-3">
                                        <div
                                            className="group relative cursor-pointer overflow-hidden border border-gray-200 bg-gray-50"
                                            onClick={() =>
                                                handleImageClick(
                                                    announce.description,
                                                )
                                            }
                                        >
                                            <Image
                                                src={announce.description}
                                                alt="팝업 이미지 미리보기"
                                                className="h-32 w-full object-cover transition-transform hover:scale-105 sm:h-40"
                                                width={500}
                                                height={500}
                                                style={{
                                                    pointerEvents: "none", // 이미지 자체의 이벤트 차단
                                                }}
                                                onError={(e) => {
                                                    // 이미지 로드 실패 시 대체 컨텐츠 표시
                                                    (
                                                        e.target as HTMLImageElement
                                                    ).style.display = "none";
                                                }}
                                                priority={false}
                                                unoptimized // 외부 이미지인 경우 최적화 비활성화
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 opacity-0 transition-all group-hover:bg-opacity-20 group-hover:opacity-100">
                                                <div className="flex items-center gap-2 rounded bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-lg">
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
                                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                        />
                                                    </svg>
                                                    이미지 확대
                                                </div>
                                            </div>
                                            {!announce.visible && (
                                                <div className="pointer-events-none absolute inset-0 bg-gray-900 bg-opacity-30">
                                                    <div className="absolute bottom-2 right-2">
                                                        <span className="bg-gray-800 px-2 py-1 text-xs text-white">
                                                            숨김 처리됨
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <p
                                            className={`text-xs ${announce.visible ? "text-gray-500" : "text-gray-400"}`}
                                        >
                                            팝업 이미지 - 클릭하여 확대
                                        </p>
                                    </div>
                                ) : (
                                    <p
                                        className={`line-clamp-2 font-medium leading-relaxed ${
                                            announce.visible
                                                ? "text-gray-900"
                                                : "text-gray-500"
                                        }`}
                                    >
                                        {announce.description}
                                        {!announce.visible && (
                                            <span className="ml-2 text-xs text-gray-400">
                                                (숨김 처리됨)
                                            </span>
                                        )}
                                    </p>
                                )}
                            </div>

                            {/* 날짜 정보 */}
                            <div className="flex flex-col gap-1 text-xs text-gray-500">
                                <span>
                                    시작: {formatDate(announce.startAt)}
                                </span>
                                <span>
                                    종료: {formatDate(announce.deletedAt)}
                                </span>
                            </div>

                            {/* 로딩 오버레이 (삭제 중) */}
                            {isCurrentlyDeleting && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 bg-white px-4 py-2 shadow-lg">
                                        <div className="h-4 w-4 animate-spin border-2 border-red-600 border-t-transparent"></div>
                                        <span className="text-sm font-medium text-gray-700">
                                            삭제 중...
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* 로딩 오버레이 (토글 중) */}
                            {isCurrentlyToggling && !isCurrentlyDeleting && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 bg-white px-4 py-2 shadow-lg">
                                        <div className="h-4 w-4 animate-spin border-2 border-orange-600 border-t-transparent"></div>
                                        <span className="text-sm font-medium text-gray-700">
                                            {announce.visible
                                                ? "숨기는 중..."
                                                : "표시하는 중..."}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 이미지 확대 모달 */}
            {imageModalOpen && imageElement && (
                <ImageViewerModal
                    imageUrl={imageElement}
                    onClose={() => {
                        setImageModalOpen(false);
                        setImageElement(null);
                    }}
                />
            )}
        </>
    );
};

export default AnnounceList;
