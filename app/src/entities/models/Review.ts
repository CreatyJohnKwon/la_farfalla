// src/entities/models/Review.ts
import { IReviewDocument } from "@/src/components/review/interface";
import { randomBytes } from "crypto";
import { Schema, model, models } from "mongoose";

// 🆕 댓글 스키마 정의
const commentSchema = new Schema(
    {
        id: {
            type: String,
            required: true,
            default: () =>
                Date.now().toString() + randomBytes(4).toString("hex"), // 8자리 hex
        },
        author: { type: String, required: true },
        content: { type: String, required: true, trim: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        likesCount: { type: Number, default: 0 },
        likedUsers: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        timestamp: { type: Date, default: Date.now },
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
        // 🆕 이미지 URL 배열 - 순서대로 저장
        images: {
            type: [String],
            default: [],
            validate: {
                validator: function (images: string[]) {
                    return images.length <= 5; // 최대 5개 제한
                },
                message: "이미지는 최대 5개까지 업로드할 수 있습니다.",
            },
        },
        likesCount: {
            type: Number,
            default: 0,
            required: true,
        },
        // 🆕 좋아요 누른 사용자들 추가
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
        // 🆕 추가 메타데이터 (선택사항)
        isEdited: { type: Boolean, default: false }, // 수정 여부
        editedAt: { type: Date }, // 수정 시간
        status: {
            type: String,
            enum: ["active", "hidden", "deleted"],
            default: "active",
        }, // 상태 관리
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

// TTL 유저 삭제 로직 (30일 유예)
reviewSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 0 });

// 🆕 가상 필드 추가
reviewSchema.virtual("imageCount").get(function (this: IReviewDocument) {
    return this.images?.length || 0;
});

reviewSchema.virtual("hasImages").get(function (this: IReviewDocument) {
    return this.images && this.images.length > 0;
});

// 🆕 인스턴스 메서드 추가
reviewSchema.methods.addImage = function (imageUrl: string) {
    if (this.images.length >= 5) {
        throw new Error("최대 5개의 이미지만 추가할 수 있습니다.");
    }
    this.images.push(imageUrl);
    return this.save();
};

reviewSchema.methods.removeImage = function (imageUrl: string) {
    this.images = this.images.filter((url: string) => url !== imageUrl);
    return this.save();
};

reviewSchema.methods.toggleLike = function (userId: string) {
    const userIndex = this.likedUsers.findIndex(
        (id: any) => id.toString() === userId,
    );

    if (userIndex > -1) {
        // 이미 좋아요를 누른 경우 - 제거
        this.likedUsers.splice(userIndex, 1);
        this.likesCount = Math.max(0, this.likesCount - 1);
    } else {
        // 좋아요 추가
        this.likedUsers.push(userId);
        this.likesCount += 1;
    }

    return this.save();
};

// 🆕 정적 메서드 추가
reviewSchema.statics.findByProductWithImages = function (productId: string) {
    return this.find({
        productId,
        status: "active",
        images: { $exists: true, $not: { $size: 0 } }, // 이미지가 있는 리뷰만
    }).populate("userId", "name email");
};

// 인덱스
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ "comments.userId": 1 });
reviewSchema.index({ images: 1 }); // 🆕 이미지 검색을 위한 인덱스
reviewSchema.index({ likesCount: -1 }); // 🆕 좋아요 수 정렬을 위한 인덱스
reviewSchema.index({ status: 1, createdAt: -1 }); // 🆕 상태별 정렬 인덱스

export const Review =
    models.Review || model<IReviewDocument>("Review", reviewSchema);
