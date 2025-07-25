import { Schema, model, models } from "mongoose";

const userLikeSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reviewId: { type: Schema.Types.ObjectId, ref: "Review", required: true },
    commentId: { type: String, required: false }, // 댓글 ID 추가
    type: { type: String, enum: ["review", "comment"], required: true },
    createdAt: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
});

// 사용자당 리뷰당 하나의 좋아요만 가능
userLikeSchema.index(
    { userId: 1, reviewId: 1 },
    {
        unique: true,
    }
);

// TTL 유저 삭제 로직 (30일 유예)
userLikeSchema.index({ userId: 1, deletedAt: 1 });

export const UserLike = models.UserLike || model("UserLike", userLikeSchema);
