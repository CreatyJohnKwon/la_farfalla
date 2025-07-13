// src/entities/models/Review.ts
import { IReviewDocument } from "@/src/components/review/interface";
import { Schema, model, models } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// 🆕 댓글 스키마 정의
const CommentSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
            default: uuidv4, // UUID 생성
        },
        author: { type: String, required: true },
        content: { type: String, required: true, trim: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        likesCount: { type: Number, default: 0 }, // 🔄 likes → likesCount
        likedUsers: [
            {
                // 🆕 좋아요 누른 사용자들
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        timestamp: { type: Date, default: Date.now },
    },
    { _id: false },
);

const ReviewSchema = new Schema<IReviewDocument>(
    {
        author: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        likesCount: {
            type: Number,
            default: 0,
            required: true, // 🔄 오타 수정: require -> required
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
        comments: [CommentSchema], // 🆕 댓글 배열 추가
    },
    {
        timestamps: true,
    },
);

// 인덱스
ReviewSchema.index({ productId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, createdAt: -1 });
ReviewSchema.index({ "comments.userId": 1 }); // 🆕 댓글 사용자 인덱스 추가

export const Review =
    models.Review || model<IReviewDocument>("Review", ReviewSchema);
