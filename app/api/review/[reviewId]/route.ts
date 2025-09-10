// api/review/[reviewId]/route.ts (이미지 지원 버전)

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { getAuthSession } from "@src/shared/lib/session";
import User from "@src/entities/models/User";
import { Review } from "@src/entities/models/Review";

// PUT - 리뷰 수정 (이미지 포함)
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

        const { content, images } = await req.json(); // 🆕 images 추가
        const { reviewId } = await params;

        // 🆕 기본 검증
        if (!content && images === undefined) {
            return NextResponse.json(
                { error: "수정할 내용이 필요합니다" },
                { status: 400 },
            );
        }

        // 🆕 이미지 검증
        if (images && Array.isArray(images)) {
            if (images.length > 5) {
                return NextResponse.json(
                    { error: "이미지는 최대 5개까지 업로드할 수 있습니다" },
                    { status: 400 },
                );
            }

            // URL 형식 검증 (선택사항)
            const invalidUrls = images.filter((url) => {
                try {
                    new URL(url);
                    return false;
                } catch {
                    return true;
                }
            });

            if (invalidUrls.length > 0) {
                return NextResponse.json(
                    { error: "유효하지 않은 이미지 URL이 포함되어 있습니다" },
                    { status: 400 },
                );
            }
        }

        // 🆕 권한 확인 추가
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

        // 🆕 리뷰 존재 및 권한 확인
        const existingReview = await Review.findById(reviewId);
        if (!existingReview) {
            return NextResponse.json(
                { error: "리뷰를 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        if (existingReview.userId.toString() !== currentUser._id.toString()) {
            return NextResponse.json(
                { error: "수정 권한이 없습니다" },
                { status: 403 },
            );
        }

        // 🆕 업데이트할 데이터 준비
        const updateData: any = {
            isEdited: true,
            editedAt: new Date(),
        };

        if (content !== undefined) {
            updateData.content = content;
        }

        if (images !== undefined) {
            updateData.images = images;
        }

        // 🔄 리뷰 업데이트
        const updatedReview = (await Review.findByIdAndUpdate(
            reviewId,
            updateData,
            { new: true },
        ).lean()) as any;

        if (!updatedReview) {
            return NextResponse.json(
                { error: "리뷰 업데이트에 실패했습니다" },
                { status: 500 },
            );
        }

        return NextResponse.json({
            message: "리뷰가 수정되었습니다",
            data: {
                ...updatedReview,
                imageCount: updatedReview.images?.length || 0, // 🆕 이미지 개수
                hasImages:
                    updatedReview.images && updatedReview.images.length > 0, // 🆕 이미지 존재 여부
                timestamp: updatedReview.createdAt,
            },
        });
    } catch (error: any) {
        console.error("리뷰 수정 중 오류:", error);
        return NextResponse.json(
            { error: "리뷰 수정 실패", details: error.message },
            { status: 500 },
        );
    }
}

// DELETE - 리뷰 삭제 (기존 로직 유지, 주석만 수정)
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ reviewId: string }> },
) {
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

        // 리뷰 존재 및 권한 확인
        const review = await Review.findById(reviewId);
        if (!review) {
            return NextResponse.json(
                { error: "리뷰를 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        if (review.userId.toString() !== currentUser._id.toString()) {
            return NextResponse.json(
                { error: "삭제 권한이 없습니다" },
                { status: 403 },
            );
        }

        // ✅ UserLike 삭제 로직 제거, 리뷰만 삭제
        await Review.findByIdAndDelete(reviewId);

        return NextResponse.json({
            message: "리뷰가 삭제되었습니다",
            data: {
                reviewId,
                deletedImagesCount: review.images?.length || 0,
            },
        });
    } catch (error: any) {
        console.error("리뷰 삭제 중 오류:", error);
        return NextResponse.json(
            { error: "리뷰 삭제 실패", details: error.message },
            { status: 500 },
        );
    }
}
