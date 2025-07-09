import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { ReviewComment } from "@/src/entities/models/ReviewComment";
import { getAuthSession } from "@/src/shared/lib/session";

export async function POST(
    req: NextRequest,
    { params }: { params: { reviewId: string; commentId: string } },
) {
    try {
        await connectDB();

        const session = await getAuthSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const commentId = params.commentId;
        const comment = await ReviewComment.findById(commentId);

        if (!comment) {
            return NextResponse.json(
                { error: "댓글을 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        // 좋아요 토글
        comment.isLiked = !comment.isLiked;
        comment.likes += comment.isLiked ? 1 : -1;

        await comment.save();

        return NextResponse.json({
            message: "좋아요가 처리되었습니다",
            data: comment,
        });
    } catch (error: any) {
        console.error("댓글 좋아요 처리 중 오류:", error);
        return NextResponse.json(
            { error: "좋아요 처리 실패", details: error.message },
            { status: 500 },
        );
    }
}
