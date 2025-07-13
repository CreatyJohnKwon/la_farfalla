// app/api/review/[reviewId]/comment/[commentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Review } from "@/src/entities/models/Review";
import { getAuthSession } from "@/src/shared/lib/session";
import User from "@/src/entities/models/User";
import { UserLike } from "@/src/entities/models/UserLike";
import mongoose from "mongoose";

interface RouteParams {
    params: Promise<{ reviewId: string; commentId: string }>;
}

// PUT - 댓글 수정
export async function PUT(req: NextRequest, { params }: RouteParams) {
    try {
        await connectDB();

        const session = await getAuthSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const currentUser = (await User.findOne({
            email: session.user.email,
        }).lean()) as any;
        if (!currentUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        const { content } = await req.json();
        const { reviewId, commentId } = await params;

        if (!content || !content.trim()) {
            return NextResponse.json(
                { error: "댓글 내용이 필요합니다" },
                { status: 400 },
            );
        }

        // 🔄 권한 확인 및 댓글 수정
        const updatedReview = await Review.findOneAndUpdate(
            {
                _id: reviewId,
                "comments.id": commentId,
                "comments.userId": currentUser._id, // 작성자만 수정 가능
            },
            {
                $set: {
                    "comments.$.content": content.trim(),
                    "comments.$.timestamp": new Date(),
                },
            },
            { new: true },
        );

        if (!updatedReview) {
            return NextResponse.json(
                { error: "댓글을 찾을 수 없거나 수정 권한이 없습니다" },
                { status: 404 },
            );
        }

        const updatedComment = updatedReview.comments.find(
            (c: any) => c.id === commentId,
        );

        return NextResponse.json({
            message: "댓글이 수정되었습니다",
            data: updatedComment,
        });
    } catch (error: any) {
        console.error("댓글 수정 중 오류:", error);
        return NextResponse.json(
            { error: "댓글 수정 실패", details: error.message },
            { status: 500 },
        );
    }
}

// DELETE - 댓글 삭제 (UserLike도 함께 삭제)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    const mongoSession = await mongoose.startSession(); // 🆕 트랜잭션 세션

    try {
        await connectDB();

        const session = await getAuthSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const currentUser = (await User.findOne({
            email: session.user.email,
        }).lean()) as any;
        if (!currentUser) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        const { reviewId, commentId } = await params;

        // 🔄 트랜잭션으로 안전하게 처리
        const result = await mongoSession.withTransaction(async () => {
            // 리뷰 존재 확인
            const review =
                await Review.findById(reviewId).session(mongoSession);
            if (!review) {
                throw new Error("리뷰를 찾을 수 없습니다");
            }

            const comment = review.comments.find(
                (c: any) => c.id === commentId,
            );
            if (!comment) {
                throw new Error("댓글을 찾을 수 없습니다");
            }

            // 작성자만 삭제 가능
            if (comment.userId.toString() !== currentUser._id.toString()) {
                throw new Error("삭제 권한이 없습니다");
            }

            // 🆕 1단계: 해당 댓글과 관련된 모든 UserLike 삭제
            const deletedLikes = await UserLike.deleteMany(
                {
                    reviewId,
                    commentId,
                    type: "comment",
                },
                { session: mongoSession },
            );

            // 🆕 2단계: 댓글 삭제
            await Review.findByIdAndUpdate(
                reviewId,
                { $pull: { comments: { id: commentId } } },
                { session: mongoSession },
            );

            return {
                commentId,
                deletedLikesCount: deletedLikes.deletedCount,
            };
        });

        return NextResponse.json({
            message: "댓글과 관련 좋아요가 삭제되었습니다",
            data: result,
        });
    } catch (error: any) {
        console.error("댓글 삭제 중 오류:", error);

        // 에러 상태 코드 구분
        const status = error.message.includes("권한")
            ? 403
            : error.message.includes("찾을 수 없습니다")
              ? 404
              : 500;

        return NextResponse.json(
            { error: error.message || "댓글 삭제 실패" },
            { status },
        );
    } finally {
        await mongoSession.endSession();
    }
}
