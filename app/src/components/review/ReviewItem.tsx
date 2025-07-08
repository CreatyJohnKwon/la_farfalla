import { Edit3, Heart, MenuSquare, MoreVertical, Trash2 } from "lucide-react";
import ReviewCommentItem from "./ReviewCommentItem";
import StarRating from "./StarRating";
import { useState } from "react";

const ReviewItem: React.FC<ReviewItemProps> = ({
    review,
    onAddComment,
    onLikeReview,
    onLikeComment,
    onEditReview,
    onEditComment,
    onDeleteReview,
    onDeleteComment,
}) => {
    const [isCommenting, setIsCommenting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [commentContent, setCommentContent] = useState("");
    const [editContent, setEditContent] = useState(review.content);
    const [editRating, setEditRating] = useState(review.rating);
    const [showMenu, setShowMenu] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const handleAddComment = () => {
        if (commentContent.trim()) {
            onAddComment(review.id, commentContent);
            setCommentContent("");
            setIsCommenting(false);
            setShowComments(true);
        }
    };

    const handleEditReview = () => {
        if (editContent.trim()) {
            onEditReview(review.id, editContent, editRating);
            setIsEditing(false);
        }
    };

    const handleLikeReview = () => {
        onLikeReview(review.id);
    };

    const handleDeleteReview = () => {
        onDeleteReview(review.id);
    };

    return (
        <div className="border-b border-gray-200 px-2 py-8 transition-all duration-300 last:border-b-0 hover:bg-gray-50/50">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                    <div>
                        <h4 className="font-semibold text-gray-900">
                            {review.author}
                        </h4>
                        <div className="mt-1 flex items-center space-x-3">
                            <StarRating
                                rating={review.rating}
                                size="sm"
                                readonly
                            />
                            <p className="text-xs text-gray-500">
                                {review.timestamp}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="rounded-full p-2 transition-colors duration-200 hover:bg-black/5"
                    >
                        <MoreVertical className="h-4 w-4 text-gray-600" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 z-10 mt-2 w-36 rounded-xl border border-gray-200/50 bg-white shadow-2xl">
                            <button
                                onClick={() => {
                                    setIsEditing(true);
                                    setShowMenu(false);
                                }}
                                className="flex w-full items-center space-x-3 rounded-t-xl px-4 py-3 text-left text-sm transition-colors duration-200 hover:bg-black/5"
                            >
                                <Edit3 className="h-4 w-4 text-gray-600" />
                                <span className="text-gray-700">수정</span>
                            </button>
                            <button
                                onClick={() => {
                                    handleDeleteReview();
                                    setShowMenu(false);
                                }}
                                className="flex w-full items-center space-x-3 rounded-b-xl px-4 py-3 text-left text-sm text-gray-700 transition-colors duration-200 hover:bg-black/5"
                            >
                                <Trash2 className="h-4 w-4 text-gray-600" />
                                <span>삭제</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-4">
                {isEditing ? (
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                별점
                            </label>
                            <StarRating
                                rating={editRating}
                                onRatingChange={setEditRating}
                                size="lg"
                            />
                        </div>
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full resize-none rounded-xl border border-gray-300 bg-white/80 p-4 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black/20"
                            rows={4}
                            placeholder="리뷰를 수정하세요..."
                        />
                        <div className="flex space-x-3">
                            <button
                                onClick={handleEditReview}
                                className="rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800"
                            >
                                수정 완료
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditContent(review.content);
                                    setEditRating(review.rating);
                                }}
                                className="rounded-xl bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="leading-relaxed text-gray-800">
                        {review.content}
                    </p>
                )}
            </div>

            <div className="mt-5 flex items-center space-x-6">
                <button
                    onClick={handleLikeReview}
                    className={`flex items-center space-x-2 rounded-full px-4 py-2 transition-all duration-200 ${
                        review.isLiked
                            ? "bg-red-50 text-red-500 hover:bg-red-100"
                            : "text-gray-600 hover:bg-black/5"
                    }`}
                >
                    <Heart
                        className={`h-4 w-4 ${review.isLiked ? "fill-current" : ""}`}
                    />
                    <span className="text-sm font-medium">{review.likes}</span>
                </button>

                <button
                    onClick={() => setIsCommenting(!isCommenting)}
                    className="flex items-center space-x-2 rounded-full px-4 py-2 text-gray-600 transition-all duration-200 hover:bg-black/5"
                >
                    <MenuSquare className="h-4 w-4" />
                    <span className="text-sm font-medium">댓글</span>
                </button>

                {review.comments.length > 0 && (
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center space-x-2 rounded-full px-4 py-2 text-gray-600 transition-all duration-200 hover:bg-black/5"
                    >
                        <span className="text-sm font-medium">
                            댓글 {review.comments.length}개{" "}
                            {showComments ? "숨기기" : "보기"}
                        </span>
                    </button>
                )}
            </div>

            {isCommenting && (
                <div className="mt-6 space-y-4">
                    <textarea
                        value={commentContent}
                        onChange={(e) => setCommentContent(e.target.value)}
                        className="w-full resize-none rounded-xl border border-gray-300 bg-white/80 p-4 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black/20"
                        rows={3}
                        placeholder="리뷰에 댓글을 작성하세요..."
                    />
                    <div className="flex space-x-3">
                        <button
                            onClick={handleAddComment}
                            className="rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800"
                        >
                            댓글 작성
                        </button>
                        <button
                            onClick={() => {
                                setIsCommenting(false);
                                setCommentContent("");
                            }}
                            className="rounded-xl bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors duration-200 hover:bg-gray-200"
                        >
                            취소
                        </button>
                    </div>
                </div>
            )}

            {showComments && review.comments.length > 0 && (
                <div className="ml-4 mt-8 space-y-0 border-l-2 border-gray-200 pl-6">
                    <h6 className="text-sm font-medium text-gray-900">
                        댓글 {review.comments.length}개
                    </h6>
                    {review.comments.map((comment) => (
                        <ReviewCommentItem
                            key={comment.id}
                            comment={comment}
                            onLike={onLikeComment}
                            onEdit={onEditComment}
                            onDelete={onDeleteComment}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewItem;
