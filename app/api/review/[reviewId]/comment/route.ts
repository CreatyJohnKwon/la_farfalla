// app/api/review/[reviewId]/comment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Review } from "@src/entities/models/Review";
import { getAuthSession } from "@src/shared/lib/session";
import User from "@src/entities/models/User";

// app/api/review/[reviewId]/comment/route.ts
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> },
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

        const user = (await User.findOne({
            email: session.user.email,
        }).lean()) as any;
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        const { content } = await req.json();
        const { reviewId } = await params;

        if (!content || !content.trim()) {
            return NextResponse.json(
                { error: "댓글 내용이 필요합니다" },
                { status: 400 },
            );
        }

        const review = await Review.findById(reviewId);
        if (!review) {
            return NextResponse.json(
                { error: "리뷰를 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        // 🔄 간단하고 안전한 ID 생성
        const commentId = `comment_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

        const newComment = {
            id: commentId, // 🔄 명확한 변수 사용
            author: user.email || session.user.email,
            content: content.trim(),
            userId: user._id,
            likesCount: 0,
            likedUsers: [],
            timestamp: new Date(),
        };

        // 🔄 실제로 데이터베이스에 저장!
        await Review.findByIdAndUpdate(
            reviewId,
            { $push: { comments: newComment } },
            { new: true },
        );

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

// GET - 댓글 조회
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> },
) {
    try {
        await connectDB();

        const { reviewId } = await params;

        const review = (await Review.findById(reviewId).lean()) as any;
        if (!review) {
            return NextResponse.json(
                { error: "리뷰를 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            type: "reviewComments",
            data: review.comments || [],
            count: review.comments?.length || 0,
        });
    } catch (error: any) {
        console.error("댓글 조회 중 오류:", error);
        return NextResponse.json(
            { error: "댓글 조회 실패", details: error.message },
            { status: 500 },
        );
    }
}
