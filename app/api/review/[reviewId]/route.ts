import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Review } from "@/src/entities/models/Review";
import { getAuthSession } from "@/src/shared/lib/session";
import User from "@/src/entities/models/User";

// PUT - 리뷰 수정
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } },
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

        const { content, rating } = await req.json();
        const reviewId = params.id;

        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            { content, rating },
            { new: true },
        ).lean();

        if (!updatedReview) {
            return NextResponse.json(
                { error: "리뷰를 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            message: "리뷰가 수정되었습니다",
            data: updatedReview,
        });
    } catch (error: any) {
        console.error("리뷰 수정 중 오류:", error);
        return NextResponse.json(
            { error: "리뷰 수정 실패", details: error.message },
            { status: 500 },
        );
    }
}

// DELETE - 리뷰 삭제
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } },
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

        const reviewId = params.id;

        const deletedReview = await Review.findByIdAndDelete(reviewId);

        if (!deletedReview) {
            return NextResponse.json(
                { error: "리뷰를 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            message: "리뷰가 삭제되었습니다",
        });
    } catch (error: any) {
        console.error("리뷰 삭제 중 오류:", error);
        return NextResponse.json(
            { error: "리뷰 삭제 실패", details: error.message },
            { status: 500 },
        );
    }
}
