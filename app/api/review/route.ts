// app/api/review/route.ts (이미지 지원 버전)
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { getAuthSession } from "@/src/shared/lib/session";
import User from "@/src/entities/models/User";
import { Review } from "@/src/entities/models/Review";
import { UserProfileData } from "@/src/entities/type/interfaces";

// GET - 리뷰 목록 조회 (이미지 포함, 사용자별 좋아요 상태 포함)
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const session = await getAuthSession();
        let currentUserId = null;

        if (session?.user?.email) {
            const currentUser = (await User.findOne({
                email: session.user.email,
            }).lean()) as any;
            currentUserId = currentUser?._id;
        }

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");
        const query = productId ? { productId } : {};

        const reviews = (await Review.find(query)
            .populate("author", "name email")
            .sort({ createdAt: -1 })
            .lean()) as any[];

        // ✅ UserLike 없이 직접 확인
        const reviewsWithLikeStatus = reviews.map((review) => {
            // 리뷰 좋아요 상태
            const isLiked = currentUserId
                ? review.likedUsers?.some(
                      (userId: any) =>
                          userId.toString() === currentUserId.toString(),
                  )
                : false;

            // 댓글 좋아요 상태
            const commentsWithLikeStatus = (review.comments || []).map(
                (comment: any) => ({
                    ...comment,
                    isLiked: currentUserId
                        ? comment.likedUsers?.some(
                              (userId: any) =>
                                  userId.toString() ===
                                  currentUserId.toString(),
                          )
                        : false,
                    likesCount: comment.likedUsers?.length || 0, // ✅ 배열 길이로 계산
                }),
            );

            return {
                ...review,
                isLiked,
                likesCount: review.likedUsers?.length || 0, // ✅ 배열 길이로 계산
                images: review.images || [],
                imageCount: review.images?.length || 0,
                hasImages: review.images && review.images.length > 0,
                timestamp: review.createdAt,
                comments: commentsWithLikeStatus,
            };
        });

        return NextResponse.json({
            type: "reviews",
            data: reviewsWithLikeStatus,
            count: reviewsWithLikeStatus.length,
        });
    } catch (error: any) {
        console.error("리뷰 조회 중 오류:", error);
        return NextResponse.json(
            { error: "리뷰 조회 실패", details: error.message },
            { status: 500 },
        );
    }
}

// POST - 리뷰 생성 (이미지 포함)
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { content, productId, images } = await req.json();

        if (!content) {
            return NextResponse.json(
                { error: "내용이 필요합니다" },
                { status: 400 },
            );
        }

        // 🆕 이미지 배열 검증
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

        const session = await getAuthSession();
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        const user = (await User.findOne({
            email: session.user.email,
        }).lean()) as UserProfileData | null;

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        const newReview = new Review({
            author: user.name || session.user.name || session.user.email,
            content,
            productId,
            userId: user._id,
            likesCount: 0,
            images: images || [], // 🆕 이미지 배열 저장
            comments: [],
        });

        await newReview.save();

        // 🔄 저장된 리뷰 반환 (이미지 포함)
        const savedReview = newReview.toObject();

        return NextResponse.json({
            message: "리뷰가 작성되었습니다",
            data: {
                ...savedReview,
                isLiked: false,
                imageCount: savedReview.images?.length || 0, // 🆕 이미지 개수
                hasImages: savedReview.images && savedReview.images.length > 0, // 🆕 이미지 존재 여부
                timestamp: savedReview.createdAt,
            },
        });
    } catch (error: any) {
        console.error("리뷰 작성 중 오류:", error);
        return NextResponse.json(
            { error: "리뷰 작성 실패", details: error.message },
            { status: 500 },
        );
    }
}
