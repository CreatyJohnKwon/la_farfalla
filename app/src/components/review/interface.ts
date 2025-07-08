interface Review {
    _id: string;
    author: string;
    content: string;
    timestamp: string;
    likes: number;
    isLiked: boolean;
    rating: number;
    comments: ReviewComment[];
}

interface ReviewComment {
    id: string;
    author: string;
    content: string;
    timestamp: string;
    likes: number;
    isLiked: boolean;
    parentId: string;
}

interface StarRatingProps {
    rating: number;
    onRatingChange?: (rating: number) => void;
    size?: "sm" | "md" | "lg";
    readonly?: boolean;
}

interface ReviewCommentItemProps {
    comment: ReviewComment;
    onLike: (commentId: string) => void;
    onEdit: (commentId: string, content: string) => void;
    onDelete: (commentId: string) => void;
}

interface ReviewItemProps {
    review: Review;
    onAddComment: (reviewId: string, content: string) => void;
    onLikeReview: (reviewId: string) => void;
    onLikeComment: (commentId: string) => void;
    onEditReview: (reviewId: string, content: string, rating: number) => void;
    onEditComment: (commentId: string, content: string) => void;
    onDeleteReview: (reviewId: string) => void;
    onDeleteComment: (commentId: string) => void;
}
