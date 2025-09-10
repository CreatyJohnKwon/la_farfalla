// src/entities/models/Review.ts
import { IReviewDocument } from "@src/components/review/interface";
import { randomBytes } from "crypto";
import { Schema, model, models } from "mongoose";

// 댓글 스키마
const commentSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
            default: () =>
                Date.now().toString() + randomBytes(4).toString("hex"),
        },
        author: { type: String, required: true },
        content: { type: String, required: true, trim: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        likedUsers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        timestamp: { type: Date, default: Date.now },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    { _id: false },
);

const reviewSchema = new Schema<IReviewDocument>(
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
        images: {
            type: [String],
            default: [],
            validate: {
                validator: function (images: string[]) {
                    return images.length <= 5;
                },
                message: "이미지는 최대 5개까지 업로드할 수 있습니다.",
            },
        },
        likedUsers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
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
        comments: [commentSchema],
        isEdited: { type: Boolean, default: false },
        editedAt: { type: Date },
        status: {
            type: String,
            enum: ["active", "hidden", "deleted"],
            default: "active",
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

// TTL 인덱스
reviewSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 0 });

// ✅ 가상 필드로 likesCount 계산
reviewSchema.virtual("likesCount").get(function (this: IReviewDocument) {
    return this.likedUsers?.length || 0;
});

// ✅ 댓글 좋아요 수 계산 (가상 필드)
commentSchema.virtual("likesCount").get(function () {
    return this.likedUsers?.length || 0;
});

reviewSchema.virtual("imageCount").get(function (this: IReviewDocument) {
    return this.images?.length || 0;
});

reviewSchema.virtual("hasImages").get(function (this: IReviewDocument) {
    return this.images && this.images.length > 0;
});

// ✅ 수정된 인스턴스 메서드 (UserLike 없이)
reviewSchema.methods.toggleLike = function (userId: string) {
    const userIndex = this.likedUsers.findIndex(
        (id: any) => id.toString() === userId,
    );

    if (userIndex > -1) {
        // 좋아요 취소
        this.likedUsers.splice(userIndex, 1);
    } else {
        // 좋아요 추가
        this.likedUsers.push(userId);
    }

    return this.save();
};

// 인덱스
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ "comments.userId": 1 });
reviewSchema.index({ images: 1 });
reviewSchema.index({ likedUsers: 1 }); // ✅ likedUsers 인덱스 추가
reviewSchema.index({ status: 1, createdAt: -1 });

export const Review =
    models.Review || model<IReviewDocument>("Review", reviewSchema);
