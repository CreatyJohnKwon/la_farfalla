// app/api/review/[reviewId]/comment/[commentId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Review } from "@/src/entities/models/Review";
import { getAuthSession } from "@/src/shared/lib/session";
import User from "@/src/entities/models/User";

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

        const review = await Review.findById(reviewId);
        if (!review) {
            return NextResponse.json(
                { error: "리뷰를 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        const comment = review.comments.find((c: any) => c.id === commentId);
        if (!comment) {
            return NextResponse.json(
                { error: "댓글을 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        // 작성자만 삭제 가능
        if (comment.userId.toString() !== currentUser._id.toString()) {
            return NextResponse.json(
                { error: "삭제 권한이 없습니다" },
                { status: 403 },
            );
        }

        // ✅ UserLike 삭제 로직 제거, 댓글만 삭제
        await Review.findByIdAndUpdate(reviewId, {
            $pull: { comments: { id: commentId } },
        });

        return NextResponse.json({
            message: "댓글이 삭제되었습니다",
            data: { commentId },
        });
    } catch (error: any) {
        console.error("댓글 삭제 중 오류:", error);
        return NextResponse.json(
            { error: "댓글 삭제 실패", details: error.message },
            { status: 500 },
        );
    }
}
