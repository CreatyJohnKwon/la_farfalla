// app/api/review/route.ts (기존 파일 수정)
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { getAuthSession } from "@/src/shared/lib/session";
import User from "@/src/entities/models/User";
import { Review } from "@/src/entities/models/Review";
import { UserLike } from "@/src/entities/models/UserLike"; // 🆕 추가
import { UserProfileData } from "@/src/entities/type/interfaces";

// GET - 리뷰 목록 조회 (사용자별 좋아요 상태 포함)
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const session = await getAuthSession();
        let currentUserId = null;

        // 현재 로그인한 사용자 ID 가져오기
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

        // 🔄 각 리뷰에 현재 사용자의 좋아요 상태 추가
        const reviewsWithLikeStatus = await Promise.all(
            reviews.map(async (review) => {
                let isLiked = false;

                // 로그인한 사용자가 있는 경우에만 좋아요 상태 확인
                if (currentUserId) {
                    const userLike = await UserLike.findOne({
                        userId: currentUserId,
                        reviewId: review._id,
                    });
                    isLiked = !!userLike;
                }

                // 🔄 댓글 좋아요 상태 계산
                const commentsWithLikeStatus = (review.comments || []).map(
                    (comment: any) => ({
                        ...comment,
                        isLiked: currentUserId
                            ? comment.likedUsers?.includes(
                                  currentUserId.toString(),
                              )
                            : false,
                        likesCount: comment.likesCount || 0,
                    }),
                );

                return {
                    ...review,
                    isLiked,
                    likesCount: review.likesCount || 0,
                    timestamp: review.createdAt,
                    comments: commentsWithLikeStatus,
                };
            }),
        );

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

// POST - 리뷰 생성 (기존 코드에서 likesCount 추가)
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { content, productId } = await req.json();

        if (!content) {
            return NextResponse.json(
                { error: "내용이 필요합니다" },
                { status: 400 },
            );
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
            author: user.name || session.user.name || session.user.email, // 🔄 이름 저장
            content,
            productId,
            userId: user._id, // ObjectId 저장
            likesCount: 0,
            comments: [],
        });

        await newReview.save();

        // 🔄 populate 제거하고 바로 반환
        const savedReview = newReview.toObject();

        return NextResponse.json({
            message: "리뷰가 작성되었습니다",
            data: {
                ...savedReview,
                isLiked: false,
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
