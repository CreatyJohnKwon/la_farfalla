import { Document, Types } from "mongoose";

// ============= 클라이언트용 인터페이스 =============
interface Review {
    _id: string;
    userId: string;
    author: string;
    content: string;
    images: string[]; // 🆕 이미지 URL 배열 추가
    timestamp: Date;
    likesCount: number;
    isLiked: boolean;
    comments: IComment[];
    // 🆕 이미지 관련 가상 필드
    imageCount?: number;
    hasImages?: boolean;
}

interface IComment {
    id: string;
    author: string;
    content: string;
    userId: string;
    likesCount: number;
    likedUsers: string[];
    isLiked: boolean;
    timestamp: Date;
}

// ============= Mongoose Document용 인터페이스 =============
interface IReviewDocument extends Document {
    _id: Types.ObjectId;
    author: string;
    content: string;
    images: string[]; // 🆕 이미지 URL 배열 추가
    likesCount: number;
    isLiked: boolean;
    userId: Types.ObjectId;
    productId?: Types.ObjectId;
    comments: IComment[];
    createdAt: Date;
    updatedAt: Date;

    // 🆕 추가 메타데이터
    isEdited?: boolean;
    editedAt?: Date;
    status?: "active" | "hidden" | "deleted";
    likedUsers?: Types.ObjectId[];

    // 🆕 인스턴스 메서드
    addImage?(imageUrl: string): Promise<IReviewDocument>;
    removeImage?(imageUrl: string): Promise<IReviewDocument>;
    toggleLike?(userId: string): Promise<IReviewDocument>;
}

interface IReviewCommentDocument extends Document {
    _id: Types.ObjectId;
    author: string;
    content: string;
    likes: number;
    isLiked: boolean;
    reviewId: Types.ObjectId;
    userId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// ============= 컴포넌트 Props 인터페이스 =============
interface ReviewCommentItemProps {
    comment: IComment;
    onLike: (reviewId: string, commentId: string) => void;
    onEdit: (commentId: string, content: string) => void;
    onDelete: (commentId: string) => void;
    userId: string;
    reviewId: string;
    onLikePending: boolean;
}

interface ReviewItemProps {
    review: Review;
    onAddComment: (reviewId: string, content: string) => void;
    onLikeReview: (reviewId: string) => void;
    onLikeComment: (reviewId: string, commentId: string) => void;
    onLikePending: boolean;
    onLikeCommentPending: boolean;
    onEditReview: (
        reviewId: string,
        content: string,
        images?: string[],
    ) => void; // 🆕 images 파라미터 추가 (선택적)
    onEditComment: (commentId: string, content: string) => void;
    onDeleteReview: (reviewId: string) => void;
    onDeleteComment: (commentId: string) => void;
}

interface ReviewSystemProps {
    productId?: string;
}

interface ToggleReviewLikeResponse {
    reviewId: string;
    isLiked: boolean;
    likesCount: number;
}

// 🆕 이미지 관련 인터페이스 추가
interface CreateReviewRequest {
    content: string;
    productId: string;
    images?: string[]; // 🆕 이미지 URL 배열
}

interface UpdateReviewRequest {
    reviewId: string;
    content?: string;
    images?: string[]; // 🆕 이미지 업데이트
}

interface ImageUploadResponse {
    success: boolean;
    urls: string[];
    errors?: string[];
}

// 🆕 타입 가드 및 유틸리티
interface ReviewWithImages extends Review {
    images: string[];
    imageCount: number;
    hasImages: true;
}

export type {
    Review,
    IReviewDocument,
    IReviewCommentDocument,
    ReviewCommentItemProps,
    ReviewItemProps,
    ReviewSystemProps,
    ToggleReviewLikeResponse,
    // 🆕 새로 추가된 타입들
    CreateReviewRequest,
    UpdateReviewRequest,
    ImageUploadResponse,
    ReviewWithImages,
};
