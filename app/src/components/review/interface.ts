import { Document, Types } from "mongoose";

// ============= 클라이언트용 인터페이스 =============
export interface Review {
    _id: string;
    author: string;
    content: string;
    timestamp: string;
    likes: number;
    isLiked: boolean;
    rating: number;
    comments: ReviewComment[];
}

export interface ReviewComment {
    id: string;
    author: string;
    content: string;
    timestamp: string;
    likes: number;
    isLiked: boolean;
    parentId: string; // reviewId
}

// ============= Mongoose Document용 인터페이스 =============
export interface IReviewDocument extends Document {
    _id: Types.ObjectId;
    author: string;
    content: string;
    rating: number;
    likes: number;
    isLiked: boolean;
    userId: Types.ObjectId;
    productId?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface IReviewCommentDocument extends Document {
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
export interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    size?: "sm" | "md" | "lg";
    readonly?: boolean;
}

export interface ReviewCommentItemProps {
    comment: ReviewComment;
    onLike: (commentId: string) => void;
    onEdit: (commentId: string, content: string) => void;
    onDelete: (commentId: string) => void;
}

export interface ReviewItemProps {
    review: Review;
    onAddComment: (reviewId: string, content: string) => void;
    onLikeReview: (reviewId: string) => void;
    onLikeComment: (commentId: string) => void;
    onEditReview: (reviewId: string, content: string, rating: number) => void;
    onEditComment: (commentId: string, content: string) => void;
    onDeleteReview: (reviewId: string) => void;
    onDeleteComment: (commentId: string) => void;
}
