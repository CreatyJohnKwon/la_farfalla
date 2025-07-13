import { Document, Types } from "mongoose";

// ============= 클라이언트용 인터페이스 =============
interface Review {
    _id: string;
    userId: string;
    author: string;
    content: string;
    timestamp: Date;
    likesCount: number;
    isLiked: boolean;
    comments: IComment[];
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
    likesCount: number;
    isLiked: boolean;
    userId: Types.ObjectId;
    productId?: Types.ObjectId;
    comments: IComment[];
    createdAt: Date;
    updatedAt: Date;
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
    onEditReview: (reviewId: string, content: string) => void;
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

export type {
    Review,
    IReviewDocument,
    IReviewCommentDocument,
    ReviewCommentItemProps,
    ReviewItemProps,
    ReviewSystemProps,
    ToggleReviewLikeResponse,
};
