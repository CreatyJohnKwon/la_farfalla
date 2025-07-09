import { Review } from "@/src/components/review/interface";

const BASE_URL =
    process.env.NODE_ENV === "production"
        ? "https://twcommunity-server.store"
        : "http://localhost:3000";

// 리뷰 목록 조회
export const getReviewList = async (
    productId?: string,
): Promise<{
    type: string;
    data: Review[];
    count: number;
}> => {
    const url = productId
        ? `${BASE_URL}/api/reviews?productId=${productId}`
        : `${BASE_URL}/api/reviews`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("리뷰 조회에 실패했습니다");
    }
    return response.json();
};

// 리뷰 생성
export const postReview = async (data: {
    content: string;
    rating: number;
    productId?: string;
}): Promise<{ message: string; data: Review }> => {
    const response = await fetch(`${BASE_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "리뷰 작성에 실패했습니다");
    }
    return response.json();
};

// 리뷰 수정
export const patchReview = async (data: {
    reviewId: string;
    content: string;
    rating: number;
}): Promise<{ message: string; data: Review }> => {
    const response = await fetch(`${BASE_URL}/api/reviews/${data.reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content: data.content,
            rating: data.rating,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "리뷰 수정에 실패했습니다");
    }
    return response.json();
};

// 리뷰 삭제
export const deleteReview = async (
    reviewId: string,
): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/api/reviews/${reviewId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "리뷰 삭제에 실패했습니다");
    }
    return response.json();
};

// 리뷰 좋아요 토글
export const toggleReviewLike = async (
    reviewId: string,
): Promise<{
    message: string;
    data: Review;
}> => {
    const response = await fetch(`${BASE_URL}/api/reviews/${reviewId}/like`, {
        method: "POST",
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "좋아요 처리에 실패했습니다");
    }
    return response.json();
};

// 댓글 관련 함수들
export const getReviewComments = async (reviewId: string) => {
    const response = await fetch(
        `${BASE_URL}/api/reviews/${reviewId}/comments`,
    );
    if (!response.ok) {
        throw new Error("댓글 조회에 실패했습니다");
    }
    return response.json();
};

export const postReviewComment = async (data: {
    reviewId: string;
    content: string;
}) => {
    const response = await fetch(
        `${BASE_URL}/api/reviews/${data.reviewId}/comments`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: data.content }),
        },
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "댓글 작성에 실패했습니다");
    }
    return response.json();
};

export const patchReviewComment = async (data: {
    reviewId: string;
    commentId: string;
    content: string;
}) => {
    const response = await fetch(
        `${BASE_URL}/api/reviews/${data.reviewId}/comments/${data.commentId}`,
        {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: data.content }),
        },
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "댓글 수정에 실패했습니다");
    }
    return response.json();
};

export const deleteReviewComment = async (data: {
    reviewId: string;
    commentId: string;
}) => {
    const response = await fetch(
        `${BASE_URL}/api/reviews/${data.reviewId}/comments/${data.commentId}`,
        {
            method: "DELETE",
        },
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "댓글 삭제에 실패했습니다");
    }
    return response.json();
};

export const toggleReviewCommentLike = async (data: {
    reviewId: string;
    commentId: string;
}) => {
    const response = await fetch(
        `${BASE_URL}/api/reviews/${data.reviewId}/comments/${data.commentId}/like`,
        {
            method: "POST",
        },
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "좋아요 처리에 실패했습니다");
    }
    return response.json();
};
