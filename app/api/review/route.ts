// app/api/review/route.ts (요청자 권한별 이메일 표시 버전)
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { getAuthSession } from "@src/shared/lib/session";
import User from "@src/entities/models/User";
import { Review } from "@src/entities/models/Review";
import { UserProfileData } from "@src/entities/type/interfaces";
import { adminEmails } from "public/data/common";
import Product from "@src/entities/models/Product";

// 🆕 요청자 권한에 따른 이메일 표시 함수
const getEmailDisplay = (
    email: string | null | undefined,
    isRequesterAdmin: any,
) => {
    if (!email || typeof email !== "string") {
        return "undefined";
    }

    // 🆕 요청자가 어드민이면 원본 이메일 전체 표시
    if (isRequesterAdmin) {
        return email;
    }

    // 🆕 일반 사용자면 앞 4자리를 별표로 치환 (@ 이후 제거)
    try {
        const [localPart] = email.split("@");

        if (localPart.length <= 4) {
            // 4자리 이하면 모두 별표로
            return "*".repeat(localPart.length);
        } else {
            // 4자리 이상이면 앞 4자리만 별표로 치환
            return "****" + localPart.slice(4);
        }
    } catch (error) {
        console.error("이메일 표시 오류:", error);
        return "undefined";
    }
};

// 🆕 사용자 표시 이름 결정 함수 (요청자 권한 반영)
const getDisplayName = (
    email: string,
    isAdmin: boolean,
    adminNames: any,
    isRequesterAdmin: any,
) => {
    if (!email) {
        return "알 수 없는 사용자";
    }

    if (isAdmin && adminNames[email]) {
        return adminNames[email]; // 어드민은 고정 이름 사용
    }

    return getEmailDisplay(email, isRequesterAdmin); // 요청자 권한에 따라 이메일 표시
};

// 🆕 어드민 체크 함수
const isAdminUser = (email: string) => {
    return adminEmails.includes(email);
};

// GET - 리뷰 목록 조회 (요청자 권한별 이메일 표시)
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const session = await getAuthSession();
        let currentUserId = null;
        let isRequesterAdmin = false; // 🆕 요청자 어드민 여부

        if (session?.user?.email) {
            const currentUser = (await User.findOne({
                email: session.user.email,
            }).lean()) as any;
            currentUserId = currentUser?._id;
            isRequesterAdmin = isAdminUser(session.user.email); // 🆕 요청자 어드민 체크
        }

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");
        const query = productId ? { productId } : {};

        const reviews = (await Review.find(query)
            .populate("userId", "name email")
            .populate("comments.userId", "name email")
            .sort({ createdAt: -1 })
            .lean()) as any[];

        const adminNames: { [key: string]: string } = {
            "admin@admin.com": "lafarfalla",
            "cofsl0411@naver.com": "lafarfalla",
            "soun0551@naver.com": "lafarfalla",
        };

        const reviewsWithLikeStatus = reviews.map((review) => {
            const reviewAuthorEmail = review.userId?.email;
            const isReviewAdmin = reviewAuthorEmail
                ? adminEmails.includes(reviewAuthorEmail)
                : false;

            // 🆕 요청자 권한에 따른 이메일 표시 적용
            const reviewDisplayName = getDisplayName(
                reviewAuthorEmail,
                isReviewAdmin,
                adminNames,
                isRequesterAdmin, // 🆕 요청자 어드민 여부 전달
            );

            // 리뷰 좋아요 상태
            const isLiked = currentUserId
                ? review.likedUsers?.some(
                      (userId: any) =>
                          userId.toString() === currentUserId.toString(),
                  )
                : false;

            // 🆕 댓글 좋아요 상태 및 요청자 권한별 이메일 표시 적용
            const commentsWithLikeStatus = (review.comments || []).map(
                (comment: any) => {
                    const userInfo = comment.userId;
                    const userEmail = userInfo?.email;

                    const isAdmin = userEmail
                        ? adminEmails.includes(userEmail)
                        : false;

                    // 🆕 댓글 작성자도 요청자 권한에 따른 이메일 표시 적용
                    const displayName = getDisplayName(
                        userEmail,
                        isAdmin,
                        adminNames,
                        isRequesterAdmin, // 🆕 요청자 어드민 여부 전달
                    );

                    return {
                        ...comment,
                        isLiked: currentUserId
                            ? comment.likedUsers?.some(
                                  (userId: any) =>
                                      userId.toString() ===
                                      currentUserId.toString(),
                              )
                            : false,
                        likesCount: comment.likedUsers?.length || 0,
                        isAdmin: isAdmin,
                        author: displayName, // 🆕 요청자 권한에 따른 표시 이름
                        // 🆕 요청자 권한에 따른 사용자 정보
                        userInfo: userInfo
                            ? {
                                  _id: userInfo._id,
                                  name: userInfo.name,
                                  email: getEmailDisplay(
                                      userInfo.email,
                                      isRequesterAdmin,
                                  ), // 🆕 요청자 권한에 따른 이메일
                                  isAdmin: isAdmin,
                              }
                            : null,
                    };
                },
            );

            return {
                ...review,
                isAdmin: isReviewAdmin,
                author: reviewDisplayName, // 🆕 요청자 권한에 따른 표시 이름
                isLiked,
                likesCount: review.likedUsers?.length || 0,
                images: review.images || [],
                imageCount: review.images?.length || 0,
                hasImages: review.images && review.images.length > 0,
                timestamp: review.createdAt,
                comments: commentsWithLikeStatus,
                // 🆕 요청자 권한에 따른 사용자 정보
                userInfo: review.userId
                    ? {
                          _id: review.userId._id,
                          name: review.userId.name,
                          email: getEmailDisplay(
                              review.userId.email,
                              isRequesterAdmin,
                          ), // 🆕 요청자 권한에 따른 이메일
                          isAdmin: isReviewAdmin,
                      }
                    : null,
                userId: review.userId?._id, // ID만 유지
            };
        });

        // 🆕 모든 리뷰 이미지 URL만 추출 (디버깅용)
        const imagesOnly = reviewsWithLikeStatus
            .flatMap((review) => review.images || [])
            .filter((url) => typeof url === "string" && url.trim() !== "");

        return NextResponse.json({
            type: "reviews",
            data: reviewsWithLikeStatus,
            count: reviewsWithLikeStatus.length,
            meta: {
                isRequesterAdmin: isRequesterAdmin,
                requesterEmail: isRequesterAdmin
                    ? session?.user?.email
                    : getEmailDisplay(session?.user?.email, false),
            },
            imagesOnly, // 🆕 모든 리뷰 이미지 URL 배열
        });
    } catch (error: any) {
        console.error("리뷰 조회 중 오류:", error);
        return NextResponse.json(
            { error: "리뷰 조회 실패", details: error.message },
            { status: 500 },
        );
    }
}

// POST - 리뷰 생성 (요청자 권한별 이메일 표시)
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { content, productId, images, rating } = await req.json();

        if (!content) {
            return NextResponse.json(
                { error: "내용이 필요합니다" },
                { status: 400 },
            );
        }

        // 이미지 배열 검증
        if (images && Array.isArray(images)) {
            if (images.length > 5) {
                return NextResponse.json(
                    { error: "이미지는 최대 5개까지 업로드할 수 있습니다" },
                    { status: 400 },
                );
            }

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

        // 🆕 요청자 어드민 체크
        const isRequesterAdmin = isAdminUser(session.user.email);

        const adminNames: { [key: string]: string } = {
            "admin@admin.com": "lafarfalla",
            "cofsl0411@naver.com": "lafarfalla",
            "soun0551@naver.com": "lafarfalla",
        };

        const isAdmin = adminEmails.includes(user.email);

        const newReview = new Review({
            author: user.email || session.user.email,
            content,
            productId,
            userId: user._id,
            likesCount: 0,
            images: images || [],
            comments: [],
            rating
        });

        await newReview.save();

        const product = await Product.findById(productId);

        if (product) {
            const averageRating = product.averageRating || 0;
            const ratingCount = product.ratingCount || 0;

            const currentTotalRating = averageRating * ratingCount;
            const newRatingCount = ratingCount + 1;
            
            // 새로운 평균 평점 계산 (소수점 2자리까지)
            const newAverageRating = parseFloat(
                ((currentTotalRating + rating) / newRatingCount).toFixed(2)
            );

            // Product 문서에 새로운 값으로 업데이트
            product.averageRating = newAverageRating;
            product.ratingCount = newRatingCount;

            await product.save();
        } else {
            // 해당 productId를 가진 제품이 없을 경우에 대한 예외 처리
            console.warn(`리뷰가 작성되었지만, productId ${productId}에 해당하는 제품을 찾을 수 없어 평점을 업데이트하지 못했습니다.`);
        }

        const savedReview = newReview.toObject();

        // 🆕 요청자 권한에 따른 표시 이름
        const displayName = getDisplayName(
            user.email,
            isAdmin,
            adminNames,
            isRequesterAdmin,
        );

        return NextResponse.json({
            message: "리뷰가 작성되었습니다",
            data: {
                ...savedReview,
                isLiked: false,
                imageCount: savedReview.images?.length || 0,
                hasImages: savedReview.images && savedReview.images.length > 0,
                timestamp: savedReview.createdAt,
                // 🆕 요청자 권한에 따른 사용자 정보
                author: displayName,
                isAdmin: isAdmin,
                userInfo: {
                    _id: user._id,
                    name: user.name,
                    email: getEmailDisplay(user.email, isRequesterAdmin), // 🆕 요청자 권한에 따른 이메일
                    isAdmin: isAdmin,
                },
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
