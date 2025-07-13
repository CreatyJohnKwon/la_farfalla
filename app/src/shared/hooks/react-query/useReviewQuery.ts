// 기존 파일에 추가
import {
    getReviewList,
    postReview,
    patchReview,
    deleteReview,
    toggleReviewLike,
    toggleReviewCommentLike,
    deleteReviewComment,
    patchReviewComment,
    postReviewComment,
    getReviewComments,
} from "@/src/shared/lib/server/review";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// 리뷰 목록 조회
const useGetReviewsListQuery = (productId?: string) => {
    return useQuery({
        queryKey: ["reviews", productId],
        queryFn: () => getReviewList(productId),
        retry: false,
    });
};

// 리뷰 생성
const usePostReviewMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: postReview,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["reviews", variables.productId],
            });
        },
        onError: (error: any) =>
            alert(error.message || "리뷰 작성 중 오류 발생"),
    });
};

// 리뷰 수정
const useUpdateReviewMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: patchReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
        },
    });
};

// 리뷰 삭제
const useDeleteReviewMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
        },
    });
};

// 리뷰 좋아요 토글
const useToggleReviewLikeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: toggleReviewLike,
        // ✨ Optimistic Update 추가 (선택사항)
        onMutate: async (reviewId: string) => {
            // 진행 중인 쿼리 취소
            await queryClient.cancelQueries({ queryKey: ["reviews"] });

            // 이전 데이터 백업
            const previousReviews = queryClient.getQueryData(["reviews"]);

            // 즉시 UI 업데이트
            queryClient.setQueryData(["reviews"], (old: any) => {
                if (!old?.data) return old;

                return {
                    ...old,
                    data: old.data.map((review: any) => {
                        if (review._id === reviewId) {
                            return {
                                ...review,
                                isLiked: !review.isLiked,
                                likesCount: review.isLiked
                                    ? review.likesCount - 1
                                    : review.likesCount + 1,
                            };
                        }
                        return review;
                    }),
                };
            });

            return { previousReviews };
        },
        onSuccess: (data) => {
            // 🔄 성공시 실제 데이터로 정확히 업데이트
            queryClient.setQueryData(["reviews"], (old: any) => {
                if (!old?.data) return old;

                return {
                    ...old,
                    data: old.data.map((review: any) => {
                        if (review._id === data.reviewId) {
                            return {
                                ...review,
                                isLiked: data.isLiked,
                                likesCount: data.likesCount,
                            };
                        }
                        return review;
                    }),
                };
            });

            // 캐시 갱신 (이중 보장)
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
        },
        // ❌ 에러시 롤백
        onError: (err, reviewId, context) => {
            if (context?.previousReviews) {
                queryClient.setQueryData(["reviews"], context.previousReviews);
            }
            console.error("좋아요 처리 실패:", err);
        },
    });
};

// 댓글 목록 조회
const useGetCommentsQuery = (reviewId: string) => {
    return useQuery({
        queryKey: ["comments", reviewId],
        queryFn: () => getReviewComments(reviewId),
        retry: false,
    });
};

// 댓글 생성
const usePostCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: postReviewComment,
        onSuccess: (data, variables) => {
            // 댓글 쿼리 업데이트
            queryClient.invalidateQueries({
                queryKey: ["comments", variables.reviewId],
            });
            // 🔄 리뷰 쿼리도 함께 업데이트 (댓글 수 반영 등)
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
        },
        onError: (error: any) =>
            alert(error.message || "댓글 작성 중 오류 발생"),
    });
};

// 댓글 수정
const useUpdateCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: patchReviewComment,
        onSuccess: (data, variables) => {
            // 댓글 쿼리 업데이트
            queryClient.invalidateQueries({
                queryKey: ["comments", variables.reviewId],
            });
            // 🔄 리뷰 쿼리도 함께 업데이트
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
        },
    });
};

// 댓글 삭제
const useDeleteCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteReviewComment,
        onSuccess: (data, variables) => {
            // 댓글 쿼리 업데이트
            queryClient.invalidateQueries({
                queryKey: ["comments", variables.reviewId],
            });
            // 🔄 리뷰 쿼리도 함께 업데이트
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
        },
    });
};

// 댓글 좋아요 토글
const useToggleCommentLikeMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            reviewId,
            commentId,
        }: {
            reviewId: string;
            commentId: string;
        }) => toggleReviewCommentLike(reviewId, commentId),
        onSuccess: (data, variables) => {
            // 🔄 리뷰 목록의 해당 댓글 좋아요 상태 업데이트
            queryClient.setQueryData(["reviews"], (old: any) => {
                if (!old?.data) return old;

                return {
                    ...old,
                    data: old.data.map((review: any) => {
                        if (review._id === variables.reviewId) {
                            return {
                                ...review,
                                comments: review.comments.map((comment: any) =>
                                    comment.id === variables.commentId
                                        ? {
                                              ...comment,
                                              isLiked: data.isLiked,
                                              likesCount: data.likesCount,
                                          }
                                        : comment,
                                ),
                            };
                        }
                        return review;
                    }),
                };
            });

            // 전체 캐시 갱신
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
        },
        onError: (error) => {
            console.error("댓글 좋아요 처리 실패:", error);
        },
    });
};

export {
    // 기존 exports...
    useGetReviewsListQuery,
    usePostReviewMutation,
    useUpdateReviewMutation,
    useDeleteReviewMutation,
    useToggleReviewLikeMutation,
    useGetCommentsQuery,
    usePostCommentMutation,
    useUpdateCommentMutation,
    useDeleteCommentMutation,
    useToggleCommentLikeMutation,
};
