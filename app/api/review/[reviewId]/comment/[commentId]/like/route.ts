import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { getAuthSession } from "@/src/shared/lib/session";
import { Review } from "@/src/entities/models/Review";
import User from "@/src/entities/models/User";

interface RouteParams {
    params: Promise<{ reviewId: string; commentId: string }>; // Promise로 래핑
}

// app/api/review/[reviewId]/comment/[commentId]/like/route.ts
export async function POST(req: NextRequest, { params }: RouteParams) {
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

        // 🔄 좋아요 상태 확인 및 토글
        const isLiked = comment.likedUsers.includes(currentUser._id);

        if (isLiked) {
            // 좋아요 취소
            await Review.findOneAndUpdate(
                { _id: reviewId, "comments.id": commentId },
                {
                    $pull: { "comments.$.likedUsers": currentUser._id },
                    $inc: { "comments.$.likesCount": -1 },
                },
            );
        } else {
            // 좋아요 추가
            await Review.findOneAndUpdate(
                { _id: reviewId, "comments.id": commentId },
                {
                    $addToSet: { "comments.$.likedUsers": currentUser._id },
                    $inc: { "comments.$.likesCount": 1 },
                },
            );
        }

        // 업데이트된 정보 조회
        const updatedReview = await Review.findById(reviewId);
        const updatedComment = updatedReview?.comments.find(
            (c: any) => c.id === commentId,
        );

        return NextResponse.json({
            message: "댓글 좋아요가 처리되었습니다",
            data: {
                commentId,
                isLiked: !isLiked,
                likesCount: updatedComment?.likesCount || 0,
            },
        });
    } catch (error: any) {
        console.error("댓글 좋아요 처리 중 오류:", error);
        return NextResponse.json(
            { error: "댓글 좋아요 처리 실패", details: error.message },
            { status: 500 },
        );
    }
}
