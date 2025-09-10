// app/api/review/[reviewId]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Review } from "@src/entities/models/Review";
import { getAuthSession } from "@src/shared/lib/session";
import User from "@src/entities/models/User";

interface RouteParams {
    params: Promise<{ reviewId: string }>;
}

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

        const { reviewId } = await params;

        const review = await Review.findById(reviewId);
        if (!review) {
            return NextResponse.json(
                { error: "리뷰를 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        // ✅ likedUsers 배열에서 직접 확인
        const isLiked = review.likedUsers.includes(currentUser._id);

        if (isLiked) {
            // 좋아요 취소
            await Review.findByIdAndUpdate(reviewId, {
                $pull: { likedUsers: currentUser._id },
            });
        } else {
            // 좋아요 추가
            await Review.findByIdAndUpdate(reviewId, {
                $addToSet: { likedUsers: currentUser._id },
            });
        }

        // 업데이트된 정보 조회
        const updatedReview = await Review.findById(reviewId);
        const likesCount = updatedReview?.likedUsers?.length || 0;

        return NextResponse.json({
            message: "좋아요가 처리되었습니다",
            data: {
                reviewId,
                isLiked: !isLiked,
                likesCount, // ✅ likedUsers.length로 계산
            },
        });
    } catch (error: any) {
        console.error("좋아요 처리 중 오류:", error);
        return NextResponse.json(
            { error: "좋아요 처리 실패", details: error.message },
            { status: 500 },
        );
    }
}
