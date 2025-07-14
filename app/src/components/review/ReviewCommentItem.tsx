import { Edit3, Heart, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { ReviewCommentItemProps } from "./interface";
import LoadingSpinner from "@/src/widgets/spinner/LoadingSpinner";

const ReviewCommentItem: React.FC<ReviewCommentItemProps> = ({
    comment,
    onLike,
    onEdit,
    onDelete,
    userId,
    reviewId,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showMenu, setShowMenu] = useState(false);
    const [isLiking, setIsLiking] = useState(false); // 개별 좋아요 로딩 상태 추가

    const handleEdit = () => {
        if (editContent.trim()) {
            onEdit(comment.id, editContent);
            setIsEditing(false);
        }
    };

    const handleLike = (commentId: string) => async () => {
        if (isLiking) return; // 이미 로딩 중이면 중복 실행 방지

        setIsLiking(true); // 로딩 시작
        try {
            await onLike(reviewId, commentId);
        } finally {
            setIsLiking(false); // 로딩 끝
        }
    };

    const handleDelete = () => {
        onDelete(comment.id);
    };

    return (
        <div className="border-b border-gray-100 px-1 py-4 transition-all duration-200 last:border-b-0 hover:bg-gray-50/30">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <div>
                        <h5 className="text-sm font-medium text-gray-900">
                            {comment.author}
                        </h5>
                        <p className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleDateString(
                                "ko-KR",
                                {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                },
                            )}
                        </p>
                    </div>
                </div>

                <div className="relative">
                    {comment.userId === userId && (
                        <>
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-1.5 transition-colors duration-200 hover:bg-black/5"
                            >
                                <MoreVertical className="h-3 w-3 text-gray-600" />
                            </button>
                        </>
                    )}

                    {showMenu && (
                        <div className="absolute right-0 z-10 mt-2 w-32 border border-gray-200/50 bg-white shadow-2xl">
                            <button
                                onClick={() => {
                                    setIsEditing(true);
                                    setShowMenu(false);
                                }}
                                className="flex w-full items-center space-x-2 px-3 py-2 text-left text-xs transition-colors duration-200 hover:bg-black/5"
                            >
                                <Edit3 className="h-3 w-3 text-gray-600" />
                                <span className="text-gray-700">수정</span>
                            </button>
                            <button
                                onClick={() => {
                                    handleDelete();
                                    setShowMenu(false);
                                }}
                                className="flex w-full items-center space-x-2 px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-black/5"
                            >
                                <Trash2 className="h-3 w-3 text-gray-600" />
                                <span>삭제</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-3">
                {isEditing ? (
                    <div className="space-y-3">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="order w-full resize-none border-gray-300 bg-white/80 p-3 text-sm backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black/20"
                            rows={2}
                            placeholder="댓글을 수정하세요..."
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={handleEdit}
                                className="bg-black px-4 py-2 text-xs font-medium text-white transition-colors duration-200 hover:bg-gray-800"
                            >
                                수정 완료
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditContent(comment.content);
                                }}
                                className="bg-gray-100 px-4 py-2 text-xs font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm leading-relaxed text-gray-800">
                        {comment.content}
                    </p>
                )}
            </div>

            <div className="mt-5 flex items-center space-x-6">
                <button
                    onClick={handleLike(comment.id)} // 댓글 ID 전달
                    disabled={isLiking} // 개별 로딩 상태로 변경
                    className={`flex items-center space-x-2 px-4 py-2 transition-all duration-200 ${
                        comment.likedUsers.includes(userId)
                            ? "scale-110 text-red-500" // 🔄 채워진 빨간색
                            : "text-gray-600 hover:text-red-400" // 🔄 호버 시 연한 빨간색
                    } ${
                        isLiking // 개별 로딩 상태로 변경
                            ? "cursor-not-allowed opacity-50"
                            : "hover:scale-105" // 호버 효과 추가
                    }`}
                >
                    {/* 개별 로딩 상태로 변경 */}
                    {isLiking ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-red-500" />
                    ) : (
                        <Heart
                            className={`h-4 w-4 transition-all duration-200 ${
                                comment.isLiked ? "scale-110" : ""
                            }`}
                        />
                    )}
                    <span className="text-sm font-medium">
                        {comment.likesCount}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default ReviewCommentItem;
