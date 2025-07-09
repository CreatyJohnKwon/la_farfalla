import { IReviewCommentDocument } from "@/src/components/review/interface";
import { Schema, model, models } from "mongoose";

const reviewCommentSchema = new Schema<IReviewCommentDocument>(
    {
        author: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        likes: {
            type: Number,
            default: 0,
            min: 0,
        },
        isLiked: {
            type: Boolean,
            default: false,
        },
        reviewId: {
            type: Schema.Types.ObjectId,
            ref: "Review",
            required: true,
            index: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    },
);

// 인덱스
reviewCommentSchema.index({ reviewId: 1, createdAt: -1 });

export const ReviewComment =
    models.ReviewComment ||
    model<IReviewCommentDocument>("ReviewComment", reviewCommentSchema);
