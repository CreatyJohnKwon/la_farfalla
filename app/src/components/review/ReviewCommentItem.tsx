import { Edit3, Heart, MoreVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { ReviewCommentItemProps } from "./interface";

const ReviewCommentItem: React.FC<ReviewCommentItemProps> = ({
    comment,
    onLike,
    onEdit,
    onDelete,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [showMenu, setShowMenu] = useState(false);

    const handleEdit = () => {
        if (editContent.trim()) {
            onEdit(comment.id, editContent);
            setIsEditing(false);
        }
    };

    const handleLike = () => {
        onLike(comment.id);
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
                            {comment.timestamp}
                        </p>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="rounded-full p-1.5 transition-colors duration-200 hover:bg-black/5"
                    >
                        <MoreVertical className="h-3 w-3 text-gray-600" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 z-10 mt-2 w-32 rounded-xl border border-gray-200/50 bg-white shadow-2xl">
                            <button
                                onClick={() => {
                                    setIsEditing(true);
                                    setShowMenu(false);
                                }}
                                className="flex w-full items-center space-x-2 rounded-t-xl px-3 py-2 text-left text-xs transition-colors duration-200 hover:bg-black/5"
                            >
                                <Edit3 className="h-3 w-3 text-gray-600" />
                                <span className="text-gray-700">수정</span>
                            </button>
                            <button
                                onClick={() => {
                                    handleDelete();
                                    setShowMenu(false);
                                }}
                                className="flex w-full items-center space-x-2 rounded-b-xl px-3 py-2 text-left text-xs text-gray-700 transition-colors duration-200 hover:bg-black/5"
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
                            className="w-full resize-none rounded-lg border border-gray-300 bg-white/80 p-3 text-sm backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black/20"
                            rows={2}
                            placeholder="댓글을 수정하세요..."
                        />
                        <div className="flex space-x-2">
                            <button
                                onClick={handleEdit}
                                className="rounded-lg bg-black px-4 py-2 text-xs font-medium text-white transition-colors duration-200 hover:bg-gray-800"
                            >
                                수정 완료
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditContent(comment.content);
                                }}
                                className="rounded-lg bg-gray-100 px-4 py-2 text-xs font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200"
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

            <div className="mt-3 flex items-center">
                <button
                    onClick={handleLike}
                    className={`flex items-center space-x-1 rounded-full px-3 py-1.5 transition-all duration-200 ${
                        comment.isLiked
                            ? "bg-red-50 text-red-500 hover:bg-red-100"
                            : "text-gray-600 hover:bg-black/5"
                    }`}
                >
                    <Heart
                        className={`h-3 w-3 ${comment.isLiked ? "fill-current" : ""}`}
                    />
                    <span className="text-xs font-medium">{comment.likes}</span>
                </button>
            </div>
        </div>
    );
};

export default ReviewCommentItem;
