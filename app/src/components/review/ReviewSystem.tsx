import { useState } from "react";
import StarRating from "./StarRating";
import ReviewItem from "./ReviewItem";
import { Star } from "lucide-react";

const ReviewSystem: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([
        {
            _id: "1",
            author: "김철수",
            content:
                "정말 훌륭한 서비스입니다! 직원분들이 매우 친절하고 전문적이었어요. 다음에도 꼭 이용하고 싶습니다.",
            timestamp: "2시간 전",
            likes: 15,
            isLiked: false,
            rating: 4.5,
            comments: [
                {
                    id: "2",
                    author: "관리자",
                    content:
                        "소중한 리뷰 감사합니다! 앞으로도 더 나은 서비스로 보답하겠습니다.",
                    timestamp: "1시간 전",
                    likes: 3,
                    isLiked: false,
                    parentId: "1",
                },
            ],
        },
        {
            _id: "3",
            author: "이영희",
            content:
                "전체적으로 만족스러웠지만 대기시간이 조금 길었어요. 그래도 결과는 매우 좋았습니다.",
            timestamp: "5시간 전",
            likes: 8,
            isLiked: true,
            rating: 4.0,
            comments: [],
        },
    ]);

    const [newReview, setNewReview] = useState("");
    const [newRating, setNewRating] = useState(5);

    const addReview = (content: string, rating: number) => {
        const review: Review = {
            _id: Date.now().toString(),
            author: "사용자",
            content,
            timestamp: "방금 전",
            likes: 0,
            isLiked: false,
            rating,
            comments: [],
        };
        setReviews([review, ...reviews]);
    };

    const addComment = (reviewId: string, content: string) => {
        const comment: ReviewComment = {
            id: Date.now().toString(),
            author: "사용자",
            content,
            timestamp: "방금 전",
            likes: 0,
            isLiked: false,
            parentId: reviewId,
        };

        setReviews(
            reviews.map((review) =>
                review._id === reviewId
                    ? { ...review, comments: [...review.comments, comment] }
                    : review,
            ),
        );
    };

    const toggleLikeReview = (reviewId: string) => {
        setReviews(
            reviews.map((review) =>
                review._id === reviewId
                    ? {
                          ...review,
                          isLiked: !review.isLiked,
                          likes: review.isLiked
                              ? review.likes - 1
                              : review.likes + 1,
                      }
                    : review,
            ),
        );
    };

    const toggleLikeComment = (commentId: string) => {
        setReviews(
            reviews.map((review) => ({
                ...review,
                comments: review.comments.map((comment) =>
                    comment.id === commentId
                        ? {
                              ...comment,
                              isLiked: !comment.isLiked,
                              likes: comment.isLiked
                                  ? comment.likes - 1
                                  : comment.likes + 1,
                          }
                        : comment,
                ),
            })),
        );
    };

    const editReview = (
        reviewId: string,
        newContent: string,
        newRating: number,
    ) => {
        setReviews(
            reviews.map((review) =>
                review._id === reviewId
                    ? { ...review, content: newContent, rating: newRating }
                    : review,
            ),
        );
    };

    const editComment = (commentId: string, newContent: string) => {
        setReviews(
            reviews.map((review) => ({
                ...review,
                comments: review.comments.map((comment) =>
                    comment.id === commentId
                        ? { ...comment, content: newContent }
                        : comment,
                ),
            })),
        );
    };

    const deleteReview = (reviewId: string) => {
        setReviews(reviews.filter((review) => review._id !== reviewId));
    };

    const deleteComment = (commentId: string) => {
        setReviews(
            reviews.map((review) => ({
                ...review,
                comments: review.comments.filter(
                    (comment) => comment.id !== commentId,
                ),
            })),
        );
    };

    const handleSubmitReview = () => {
        if (newReview.trim()) {
            addReview(newReview, newRating);
            setNewReview("");
            setNewRating(5);
        }
    };

    const averageRating =
        reviews.length > 0
            ? reviews.reduce((sum, review) => sum + review.rating, 0) /
              reviews.length
            : 0;

    return (
        <div className="min-w-screen mx-auto max-h-screen bg-white p-8">
            <div className="mb-12 border border-gray-100 bg-white p-8 shadow-sm">
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
                        className="w-full resize-none rounded-xl border border-gray-300 bg-white/80 p-5 text-gray-800 placeholder-gray-500 backdrop-blur-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black/20"
                        rows={4}
                        placeholder="서비스에 대한 리뷰를 작성해주세요..."
                    />
                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmitReview}
                            className="rounded-xl bg-black px-8 py-3 font-semibold text-white transition-colors duration-200 hover:bg-gray-800"
                        >
                            리뷰 작성
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

            {reviews.length === 0 && (
                <div className="py-20 text-center">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-black/10">
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
