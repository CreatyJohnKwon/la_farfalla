import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import Order from "@src/entities/models/Order";

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
        return NextResponse.json(
            { error: "userId is required" },
            { status: 400 },
        );
    }

    await connectDB();
    const order = await Order.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json(order);
}
