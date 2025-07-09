import { IReviewDocument } from "@/src/components/review/interface";
import { Schema, model, models } from "mongoose";

const reviewSchema = new Schema<IReviewDocument>(
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
        rating: {
            type: Number,
            required: true,
            min: 0.5,
            max: 5,
            validate: {
                validator: function (value: number) {
                    return value % 0.5 === 0;
                },
                message: "별점은 0.5 단위로만 입력 가능합니다.",
            },
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
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product",
            index: true,
        },
    },
    {
        timestamps: true,
    },
);

// 인덱스
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });

export const Review =
    models.Review || model<IReviewDocument>("Review", reviewSchema);
