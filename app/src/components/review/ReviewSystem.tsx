import { useState } from "react";
import StarRating from "./StarRating";
import ReviewItem from "./ReviewItem";
import { Star } from "lucide-react";
import { Review, ReviewComment } from "./interface";
import {
    useGetReviewsListQuery,
    usePostReviewMutation,
    useUpdateReviewMutation,
    useDeleteReviewMutation,
    useToggleReviewLikeMutation,
    usePostCommentMutation,
    useUpdateCommentMutation,
    useDeleteCommentMutation,
    useToggleCommentLikeMutation,
} from "@src/shared/hooks/react-query/useReviewQuery";

interface ReviewSystemProps {
    productId?: string;
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({ productId }) => {
    // React Query 훅들
    const {
        data: reviewsData,
        isLoading,
        error,
    } = useGetReviewsListQuery(productId);
    const postReviewMutation = usePostReviewMutation();
    const updateReviewMutation = useUpdateReviewMutation();
    const deleteReviewMutation = useDeleteReviewMutation();
    const toggleReviewLikeMutation = useToggleReviewLikeMutation();
    const postCommentMutation = usePostCommentMutation();
    const updateCommentMutation = useUpdateCommentMutation();
    const deleteCommentMutation = useDeleteCommentMutation();
    const toggleCommentLikeMutation = useToggleCommentLikeMutation();

    // 로컬 상태
    const [newReview, setNewReview] = useState("");
    const [newRating, setNewRating] = useState(5);

    // 데이터 추출
    const reviews = reviewsData?.data || [];

    // 리뷰 작성
    const handleSubmitReview = async () => {
        if (newReview.trim()) {
            try {
                await postReviewMutation.mutateAsync({
                    content: newReview,
                    rating: newRating,
                    productId,
                });
                setNewReview("");
                setNewRating(5);
            } catch (error) {
                // 에러는 mutation에서 처리됨
            }
        }
    };

    // 댓글 추가
    const addComment = async (reviewId: string, content: string) => {
        try {
            await postCommentMutation.mutateAsync({
                reviewId,
                content,
            });
        } catch (error) {
            // 에러는 mutation에서 처리됨
        }
    };

    // 리뷰 좋아요 토글
    const toggleLikeReview = async (reviewId: string) => {
        try {
            await toggleReviewLikeMutation.mutateAsync(reviewId);
        } catch (error) {
            // 에러는 mutation에서 처리됨
        }
    };

    // 댓글 좋아요 토글
    const toggleLikeComment = async (commentId: string) => {
        // 댓글이 속한 리뷰 찾기
        const review = reviews.find((r) =>
            r.comments.some((c) => c.id === commentId),
        );
        if (review) {
            try {
                await toggleCommentLikeMutation.mutateAsync({
                    reviewId: review._id,
                    commentId,
                });
            } catch (error) {
                // 에러는 mutation에서 처리됨
            }
        }
    };

    // 리뷰 수정
    const editReview = async (
        reviewId: string,
        newContent: string,
        newRating: number,
    ) => {
        try {
            await updateReviewMutation.mutateAsync({
                reviewId,
                content: newContent,
                rating: newRating,
            });
        } catch (error) {
            // 에러는 mutation에서 처리됨
        }
    };

    // 댓글 수정
    const editComment = async (commentId: string, newContent: string) => {
        const review = reviews.find((r) =>
            r.comments.some((c) => c.id === commentId),
        );
        if (review) {
            try {
                await updateCommentMutation.mutateAsync({
                    reviewId: review._id,
                    commentId,
                    content: newContent,
                });
            } catch (error) {
                // 에러는 mutation에서 처리됨
            }
        }
    };

    // 리뷰 삭제
    const deleteReview = async (reviewId: string) => {
        if (confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
            try {
                await deleteReviewMutation.mutateAsync(reviewId);
            } catch (error) {
                // 에러는 mutation에서 처리됨
            }
        }
    };

    // 댓글 삭제
    const deleteComment = async (commentId: string) => {
        const review = reviews.find((r) =>
            r.comments.some((c) => c.id === commentId),
        );
        if (review && confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
            try {
                await deleteCommentMutation.mutateAsync({
                    reviewId: review._id,
                    commentId,
                });
            } catch (error) {
                // 에러는 mutation에서 처리됨
            }
        }
    };

    // 평균 별점 계산
    const averageRating =
        reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
            : 0;

    // 로딩 상태
    if (isLoading) {
        return (
            <div className="mx-auto min-h-screen bg-white p-8">
                <div className="py-20 text-center">
                    <div className="mx-auto mb-4 h-8 w-8 animate-spin border-2 border-gray-300 border-t-black"></div>
                    <p className="text-gray-500">리뷰를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <div className="mx-auto min-h-screen bg-white p-8">
                <div className="py-20 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-red-100">
                        <Star className="h-8 w-8 text-red-400" />
                    </div>
                    <p className="text-lg text-red-500">
                        리뷰를 불러오는데 실패했습니다
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                        {error.message}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 bg-black px-6 py-2 text-white hover:bg-gray-800"
                    >
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto min-h-screen bg-white p-8">
            <div className="mb-12 border border-gray-100 bg-white p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-900">
                            고객 리뷰
                        </h2>
                        <div className="flex items-center space-x-4">
                            <StarRating
                                rating={averageRating}
                                size="lg"
                                readonly
                            />
                            <span className="text-gray-600">
                                {reviews.length}개의 리뷰
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="mb-3 block text-sm font-medium text-gray-700">
                            별점을 선택하세요
                        </label>
                        <StarRating
                            rating={newRating}
                            onRatingChange={setNewRating}
                            size="lg"
                        />
                    </div>

                    <textarea
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        className="w-full resize-none border border-gray-300 bg-white p-5 text-gray-800 placeholder-gray-500 focus:border-black focus:outline-none"
                        rows={4}
                        placeholder="서비스에 대한 리뷰를 작성해주세요..."
                        disabled={postReviewMutation.isPending}
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmitReview}
                            disabled={
                                postReviewMutation.isPending ||
                                !newReview.trim()
                            }
                            className="bg-black px-8 py-3 font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                            {postReviewMutation.isPending
                                ? "작성 중..."
                                : "리뷰 작성"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="space-y-0">
                {reviews.map((review) => (
                    <ReviewItem
                        key={review._id}
                        review={review}
                        onAddComment={addComment}
                        onLikeReview={toggleLikeReview}
                        onLikeComment={toggleLikeComment}
                        onEditReview={editReview}
                        onEditComment={editComment}
                        onDeleteReview={deleteReview}
                        onDeleteComment={deleteComment}
                    />
                ))}
            </div>

            {reviews.length === 0 && !isLoading && (
                <div className="py-20 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center bg-gray-100">
                        <Star className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg text-gray-500">
                        아직 리뷰가 없습니다.
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                        첫 번째 리뷰를 작성해보세요!
                    </p>
                </div>
            )}
        </div>
    );
};

export default ReviewSystem;
