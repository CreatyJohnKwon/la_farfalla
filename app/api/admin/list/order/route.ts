import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Order } from "@src/entities/models/Order";

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // 1. URL에서 page와 limit 파라미터 가져오기
        const searchParams = req.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);

        // 2. 데이터베이스에서 건너뛸(skip) 개수 계산
        const skip = (page - 1) * limit;

        // 3. 데이터와 전체 개수를 동시에 조회하여 성능 최적화
        const [orders, totalOrders] = await Promise.all([
            Order.find()
                .sort({ createdAt: -1 }) // 최신순 정렬 유지
                .skip(skip)               // 계산된 만큼 건너뛰기
                .limit(limit),            // 지정된 개수만큼 가져오기
            Order.countDocuments(),       // 전체 주문 개수 세기
        ]);

        // 4. 다음 페이지가 있는지 계산
        const nextPage = page * limit < totalOrders ? page + 1 : null;

        // 5. useInfiniteQuery가 기대하는 형태로 데이터 구조화하여 반환
        return NextResponse.json({
            orders,
            currentPage: page,
            nextPage,
        });
    } catch (err) {
        console.error("주문 리스트 조회 실패:", err);
        return NextResponse.json(
            { success: false, message: "주문 리스트를 불러오는 데 실패했습니다." },
            { status: 500 },
        );
    }
}

// 주문 업데이트
export async function POST(req: NextRequest) {
    await connectDB();
    const { orderId, shippingStatus, trackingNumber } = await req.json();

    try {
        const updateData: any = {
            shippingStatus,
        };

        if (shippingStatus === "shipped" || shippingStatus === "cancel") {
            updateData.trackingNumber = trackingNumber;
            updateData.shippedAt = new Date();
        }

        if (shippingStatus === "confirm") {
            updateData.confirmAt = new Date();
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                $set: updateData,
            },
            { new: true },
        );

        return NextResponse.json({ success: true, data: updatedOrder });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { success: false, message: "Update failed" },
            { status: 500 },
        );
    }
}
