// app/api/orders/route.ts (또는 해당 파일 경로)

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

        // ✅ 'shippingStatus'가 'prepare'가 아닌($ne) 주문만 조회하도록 조건 추가
        const orders = await Order.find({
            userId: userId,
            shippingStatus: { $ne: "prepare" },
        }).sort({ createdAt: -1 });

        // 2. 각 주문에 대해 product 정보 추가 (이후 로직은 동일)
        const ordersWithProducts = await Promise.all(
            orders.map(async (order) => {
                const orderObj = order.toObject();

                const itemsWithProducts = await Promise.all(
                    orderObj.items.map(async (item: OrderItem) => {
                        try {
                            const product = await Product.findById(
                                item.productId,
                            ).select("image");
                            return {
                                ...item,
                                image: product ? product.image : null,
                            };
                        } catch (error) {
                            console.error(`Error finding product ${item.productId}`, error);
                            return {
                                ...item,
                                image: null, // 에러 발생 시 null 처리
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