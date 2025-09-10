import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Order } from "@src/entities/models/Order";
import Product from "@src/entities/models/Product";
import { OrderItem } from "@src/components/order/interface";

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
        return NextResponse.json(
            { error: "userId is required" },
            { status: 400 },
        );
    }

    try {
        await connectDB();

        // 1. 주문 데이터 조회
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });

        // 2. 각 주문에 대해 product 정보 추가
        const ordersWithProducts = await Promise.all(
            orders.map(async (order) => {
                const orderObj = order.toObject();

                // 각 item에 대해 product 정보 조회
                const itemsWithProducts = await Promise.all(
                    orderObj.items.map(async (item: OrderItem) => {
                        try {
                            // Product에서 image만 조회
                            const product = await Product.findById(
                                item.productId,
                            ).select("image");

                            return {
                                ...item,
                                image: product.image || null, // image 배열 직접 할당
                            };
                        } catch (error) {
                            const product = await Product.findOne({
                                _id: item.productId,
                            }).select("image");

                            return {
                                ...item,
                                product: product.image || null,
                            };
                        }
                    }),
                );

                return {
                    ...orderObj,
                    items: itemsWithProducts,
                };
            }),
        );

        return NextResponse.json(ordersWithProducts);
    } catch (error) {
        console.error("주문 조회 중 오류:", error);
        return NextResponse.json(
            { error: "서버 오류가 발생했습니다" },
            { status: 500 },
        );
    }
}
