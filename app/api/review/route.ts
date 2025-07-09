import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { getAuthSession } from "@/src/shared/lib/session";
import User from "@/src/entities/models/User";
import { Review } from "@/src/entities/models/Review";
import { UserProfileData } from "@/src/entities/type/interfaces";

// GET - 리뷰 목록 조회
export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const productId = searchParams.get("productId");

        const query = productId ? { productId } : {};

        const reviews = await Review.find(query)
            .populate("author", "name email")
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            type: "reviews",
            data: reviews,
            count: reviews.length,
        });
    } catch (error: any) {
        console.error("리뷰 조회 중 오류:", error);
        return NextResponse.json(
            { error: "리뷰 조회 실패", details: error.message },
            { status: 500 },
        );
    }
}

// POST - 리뷰 생성
export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { content, rating, productId } = await req.json();

        if (!content || !rating) {
            return NextResponse.json(
                { error: "내용과 별점이 필요합니다" },
                { status: 400 },
            );
        }

        if (rating < 0.5 || rating > 5 || rating % 0.5 !== 0) {
            return NextResponse.json(
                { error: "별점은 0.5 단위로 1-5점 사이여야 합니다" },
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

        // 간단하게 userId만 가져오기
        const user = (await User.findOne({
            email: session.user.email,
        }).lean()) as UserProfileData | null;

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        // 이제 user._id 접근 가능
        const newReview = new Review({
            author: session.user.name || session.user.email,
            content,
            rating,
            productId,
            userId: user._id,
        });

        await newReview.save();

        const populatedReview = await Review.findById(newReview._id)
            .populate("author", "name email")
            .lean();

        return NextResponse.json({
            message: "리뷰가 작성되었습니다",
            data: populatedReview,
        });
    } catch (error: any) {
        console.error("리뷰 작성 중 오류:", error);
        return NextResponse.json(
            { error: "리뷰 작성 실패", details: error.message },
            { status: 500 },
        );
    }
}
