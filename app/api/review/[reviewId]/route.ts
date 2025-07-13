import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { getAuthSession } from "@/src/shared/lib/session";
import User from "@/src/entities/models/User";
import { Review } from "@/src/entities/models/Review";
import { UserLike } from "@/src/entities/models/UserLike";
import mongoose from "mongoose";

// PUT - 댓글 수정
export async function PUT(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{ reviewId: string }>;
    },
) {
    try {
        await connectDB();

        const { content } = await req.json();
        const { reviewId } = await params; // ✅ 여기 추가!

        const updatedComment = await Review.findByIdAndUpdate(
            reviewId,
            { content },
            { new: true },
        ).lean();

        if (!updatedComment) {
            return NextResponse.json(
                { error: "리뷰를 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            message: "리뷰가 수정되었습니다",
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
    { params }: { params: Promise<{ reviewId: string }> },
) {
    const mongoSession = await mongoose.startSession();

    try {
        await connectDB();

        const authSession = await getAuthSession();
        if (!authSession?.user?.email) {
            return NextResponse.json(
                { error: "로그인이 필요합니다" },
                { status: 401 },
            );
        }

        const currentUser = (await User.findOne({
            email: authSession.user.email,
        }).lean()) as any;

        if (!currentUser) {
            return NextResponse.json(
                { error: "사용자를 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        const reviewId = (await params).reviewId;

        // 🔄 트랜잭션으로 안전하게 처리
        const result = await mongoSession.withTransaction(async () => {
            // 리뷰 존재 및 권한 확인
            const review =
                await Review.findById(reviewId).session(mongoSession);
            if (!review) {
                throw new Error("리뷰를 찾을 수 없습니다");
            }

            if (review.userId.toString() !== currentUser._id.toString()) {
                throw new Error("삭제 권한이 없습니다");
            }

            // 1. 관련된 모든 UserLike 삭제
            const deletedLikes = await UserLike.deleteMany(
                { reviewId },
                { session: mongoSession },
            );

            // 2. 리뷰 삭제
            await Review.findByIdAndDelete(reviewId, { session: mongoSession });

            return {
                reviewId,
                deletedLikesCount: deletedLikes.deletedCount,
            };
        });

        return NextResponse.json({
            message: "리뷰와 관련 좋아요가 삭제되었습니다",
            data: result,
        });
    } catch (error: any) {
        console.error("댓글 삭제 중 오류:", error);
        return NextResponse.json(
            { error: "댓글 삭제 실패", details: error.message },
            { status: 500 },
        );
    }
}
