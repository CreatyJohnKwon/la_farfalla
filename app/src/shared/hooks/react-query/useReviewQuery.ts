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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reviews"] });
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
            queryClient.invalidateQueries({
                queryKey: ["comments", variables.reviewId],
            });
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
            queryClient.invalidateQueries({
                queryKey: ["comments", variables.reviewId],
            });
        },
    });
};

// 댓글 삭제
const useDeleteCommentMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteReviewComment,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["comments", variables.reviewId],
            });
        },
    });
};

// 댓글 좋아요 토글
const useToggleCommentLikeMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: toggleReviewCommentLike,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["comments", variables.reviewId],
            });
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
