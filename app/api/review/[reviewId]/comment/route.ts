// app/api/review/[reviewId]/comment/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Review } from "@/src/entities/models/Review";
import { getAuthSession } from "@/src/shared/lib/session";
import User from "@/src/entities/models/User";
import { v4 as uuidv4 } from "uuid";

// POST - 댓글 생성
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

        // 🔄 리뷰 존재 확인
        const review = await Review.findById(reviewId);
        if (!review) {
            return NextResponse.json(
                { error: "리뷰를 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        // 🔄 새 댓글 객체 생성
        const newComment = {
            id: uuidv4,
            author: user.name || session.user.name || session.user.email,
            content: content.trim(),
            userId: user._id,
            likes: 0,
            isLiked: false,
            timestamp: new Date(),
        };

        // 🔄 Review의 comments 배열에 댓글 추가
        const updatedReview = await Review.findByIdAndUpdate(
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
