import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { ReviewComment } from "@/src/entities/models/ReviewComment";
import { getAuthSession } from "@/src/shared/lib/session";

// PUT - 댓글 수정
export async function PUT(
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

        const { content } = await req.json();
        const commentId = params.commentId;

        const updatedComment = await ReviewComment.findByIdAndUpdate(
            commentId,
            { content },
            { new: true },
        ).lean();

        if (!updatedComment) {
            return NextResponse.json(
                { error: "댓글을 찾을 수 없습니다" },
                { status: 404 },
            );
        }

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

// DELETE - 댓글 삭제
export async function DELETE(
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

        const deletedComment = await ReviewComment.findByIdAndDelete(commentId);

        if (!deletedComment) {
            return NextResponse.json(
                { error: "댓글을 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            message: "댓글이 삭제되었습니다",
        });
    } catch (error: any) {
        console.error("댓글 삭제 중 오류:", error);
        return NextResponse.json(
            { error: "댓글 삭제 실패", details: error.message },
            { status: 500 },
        );
    }
}
