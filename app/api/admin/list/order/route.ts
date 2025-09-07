import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Order } from "@src/entities/models/Order";

export async function GET(req: NextRequest) {
    await connectDB();
    const order = await Order.find().sort({ createdAt: -1 });

    return NextResponse.json(order);
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
