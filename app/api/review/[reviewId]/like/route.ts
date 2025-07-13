// app/api/review/[reviewId]/like/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Review } from "@/src/entities/models/Review";
import { UserLike } from "@/src/entities/models/UserLike";
import { getAuthSession } from "@/src/shared/lib/session";
import User from "@/src/entities/models/User";

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

        // 🔄 type 필드 추가하여 기존 좋아요 확인
        const existingLike = await UserLike.findOne({
            userId: currentUser._id,
            reviewId,
            type: "review", // 🆕 type 필드 추가
        });

        let isLiked: boolean;

        if (existingLike) {
            // 좋아요 취소
            await UserLike.deleteOne({
                userId: currentUser._id,
                reviewId,
                type: "review", // 🆕 type 필드 추가
            });
            review.likesCount = Math.max(0, review.likesCount - 1);
            isLiked = false;
        } else {
            // 🔄 좋아요 추가 시 type 필드 포함
            await UserLike.create({
                userId: currentUser._id,
                reviewId,
                type: "review", // 🆕 type 필드 추가
            });
            review.likesCount += 1;
            isLiked = true;
        }

        await review.save();

        return NextResponse.json({
            message: "좋아요가 처리되었습니다",
            data: {
                reviewId,
                isLiked,
                likesCount: review.likesCount,
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
