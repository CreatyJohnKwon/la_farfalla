import {
    Review,
    ToggleReviewLikeResponse,
} from "@/src/components/review/interface";
import { uploadImagesToServer } from "../uploadToR2";
import { ReviewPermissionResponse } from "@/src/entities/type/review";

const BASE_URL =
    process.env.NODE_ENV === "production"
        ? "https://twcommunity-server.store"
        : "http://localhost:3000";

// 리뷰 목록 조회
const getReviewList = async (
    productId?: string,
): Promise<{
    type: string;
    data: Review[];
    count: number;
}> => {
    const url = productId
        ? `${BASE_URL}/api/review?productId=${productId}`
        : `${BASE_URL}/api/review`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("리뷰 조회에 실패했습니다");
    }
    return response.json();
};

// 리뷰 생성
const postReview = async (data: {
    content: string;
    productId?: string;
    imageFiles?: File[]; // 파일 객체 배열
    images?: string[]; // 또는 이미 업로드된 URL 배열
}): Promise<{ message: string; data: Review }> => {
    let imageUrls: string[] = data.images || [];

    // 파일이 있으면 먼저 업로드
    if (data.imageFiles && data.imageFiles.length > 0) {
        try {
            const uploadedUrls = await uploadImagesToServer(data.imageFiles);
            imageUrls = uploadedUrls || [];
        } catch (error) {
            throw new Error("이미지 업로드에 실패했습니다");
        }
    }

    // 리뷰 생성
    return submitReviewToAPI({
        content: data.content,
        productId: data.productId,
        images: imageUrls,
    });
};

// 🆕 기본 API 호출만 하는 함수 (이름 변경)
const submitReviewToAPI = async (data: {
    content: string;
    productId?: string;
    images?: string[];
}): Promise<{ message: string; data: Review }> => {
    const response = await fetch(`${BASE_URL}/api/review`, {
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
const patchReview = async (data: {
    reviewId: string;
    content: string;
    images?: string[]; // 🆕 이미지 배열 추가
}): Promise<{ message: string; data: Review }> => {
    const response = await fetch(`${BASE_URL}/api/review/${data.reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            content: data.content,
            images: data.images, // 🆕 이미지 데이터 포함
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "리뷰 수정에 실패했습니다");
    }
    return response.json();
};

// 리뷰 삭제
const deleteReview = async (reviewId: string): Promise<{ message: string }> => {
    const response = await fetch(`${BASE_URL}/api/review/${reviewId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "리뷰 삭제에 실패했습니다");
    }
    return response.json();
};

// 리뷰 좋아요 토글
const toggleReviewLike = async (
    reviewId: string,
): Promise<ToggleReviewLikeResponse> => {
    const response = await fetch(`${BASE_URL}/api/review/${reviewId}/like`, {
        method: "POST",
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "좋아요 처리에 실패했습니다");
    }

    const result = await response.json();
    return result.data;
};

// 댓글 관련 함수들
const getReviewComments = async (reviewId: string) => {
    const response = await fetch(`${BASE_URL}/api/review/${reviewId}/comment`);
    if (!response.ok) {
        throw new Error("댓글 조회에 실패했습니다");
    }
    return response.json();
};

const postReviewComment = async (data: {
    reviewId: string;
    content: string;
}) => {
    const response = await fetch(
        `${BASE_URL}/api/review/${data.reviewId}/comment`,
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

const patchReviewComment = async (data: {
    reviewId: string;
    commentId: string;
    content: string;
}) => {
    const response = await fetch(
        `${BASE_URL}/api/review/${data.reviewId}/comment/${data.commentId}`,
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

const deleteReviewComment = async (data: {
    reviewId: string;
    commentId: string;
}) => {
    const response = await fetch(
        `${BASE_URL}/api/review/${data.reviewId}/comment/${data.commentId}`,
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

const toggleReviewCommentLike = async (
    reviewId: string,
    commentId: string,
): Promise<{
    commentId: string;
    isLiked: boolean;
    likesCount: number;
}> => {
    const response = await fetch(
        `${BASE_URL}/api/review/${reviewId}/comment/${commentId}/like`,
        {
            method: "POST",
        },
    );

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "댓글 좋아요 처리에 실패했습니다");
    }

    const result = await response.json();
    return result.data;
};

// 권한 검증 API 호출 함수
const checkReviewPermission = async (
    userEmail: string,
    productId: string,
): Promise<ReviewPermissionResponse> => {
    const response = await fetch(
        `/api/review/permission?userEmail=${userEmail}&productId=${productId}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
    );

    if (!response.ok) {
        throw new Error("권한 확인 실패");
    }

    return response.json();
};

export {
    getReviewList,
    getReviewComments,
    postReview,
    postReviewComment,
    patchReview,
    patchReviewComment,
    deleteReview,
    deleteReviewComment,
    toggleReviewCommentLike,
    toggleReviewLike,
    checkReviewPermission,
};
