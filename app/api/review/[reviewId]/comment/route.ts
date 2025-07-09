import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { ReviewComment } from "@/src/entities/models/ReviewComment";
import { getAuthSession } from "@/src/shared/lib/session";
import User from "@/src/entities/models/User";

// GET - 특정 리뷰의 댓글 목록 조회
export async function GET(
    req: NextRequest,
    { params }: { params: { reviewId: string } },
) {
    try {
        await connectDB();

        const reviewId = params.reviewId;

        const comments = await ReviewComment.find({ reviewId })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            type: "reviewComments",
            data: comments,
            count: comments.length,
        });
    } catch (error: any) {
        console.error("댓글 조회 중 오류:", error);
        return NextResponse.json(
            { error: "댓글 조회 실패", details: error.message },
            { status: 500 },
        );
    }
}

// POST - 댓글 생성
export async function POST(
    req: NextRequest,
    { params }: { params: { reviewId: string } },
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

        const user = await User.findOne({ email: session.user.email });
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        const { content } = await req.json();
        const reviewId = params.reviewId;

        if (!content) {
            return NextResponse.json(
                { error: "댓글 내용이 필요합니다" },
                { status: 400 },
            );
        }

        const newComment = new ReviewComment({
            author: session.user.name || session.user.email,
            content,
            reviewId,
            userId: user._id,
        });

        await newComment.save();

        return NextResponse.json({
            message: "댓글이 작성되었습니다",
            data: newComment,
        });
    } catch (error: any) {
        console.error("댓글 작성 중 오류:", error);
        return NextResponse.json(
            { error: "댓글 작성 실패", details: error.message },
            { status: 500 },
        );
    }
}
