import { OrderItem } from "@src/components/order/interface";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Order } from "@src/entities/models/Order";
import User from "@src/entities/models/User";
import { ReviewPermissionResponse } from "@src/entities/type/review";
import { NextRequest } from "next/server";
import { adminEmails } from "public/data/common";

async function checkReviewPermission(
    userId: string,
    productId: string,
): Promise<ReviewPermissionResponse> {
    try {
        // 1. 해당 사용자의 주문 내역 조회
        const orders = await Order.find({
            userId: userId,
            deletedAt: null, // 삭제되지 않은 주문만
        });

        // 2. 주문 내역에서 해당 상품을 구매한 이력이 있는지 확인
        const hasPurchased = orders.some((order) =>
            order.items.some(
                (item: OrderItem) =>
                    item.productId === productId &&
                    order.shippingStatus === "confirm", // 배송완료된 상품만
            ),
        );

        return {
            canReview: hasPurchased,
            message: hasPurchased
                ? "리뷰 작성이 가능합니다."
                : "상품을 구매하고 배송이 완료된 후 리뷰를 작성할 수 있습니다.",
        };
    } catch (error) {
        console.error("리뷰 권한 확인 오류:", error);
        return {
            canReview: false,
            message: "권한 확인 중 오류가 발생했습니다.",
        };
    }
}

export async function GET(request: NextRequest) {
    try {
        // DB 연결
        await connectDB();

        const { searchParams } = new URL(request.url);
        const userEmail = searchParams.get("userEmail");
        const productId = searchParams.get("productId");

        // 필수 파라미터 검증
        if (!userEmail || !productId) {
            return Response.json(
                { error: "userEmail과 productId가 필요합니다." }, // 🔧 에러 메시지 수정
                { status: 400 },
            );
        }

        if (adminEmails.includes(userEmail)) {
            return Response.json({
                canReview: true,
                message: "리뷰 작성이 가능합니다.",
            });
        }

        const user = await User.findOne({
            email: userEmail,
            deletedAt: null,
        });

        // 🔧 사용자 존재 확인
        if (!user) {
            return Response.json(
                {
                    canReview: false,
                    message: "사용자를 찾을 수 없습니다.",
                },
                { status: 404 },
            );
        }

        const userId = user._id.toString();

        const result = await checkReviewPermission(userId, productId);

        return Response.json(result);
    } catch (error) {
        console.error("API 오류:", error);
        return Response.json(
            { error: "서버 오류가 발생했습니다." },
            { status: 500 },
        );
    }
}
