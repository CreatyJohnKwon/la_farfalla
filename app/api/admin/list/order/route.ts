import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import Order from "@src/entities/models/Order";

export async function GET(req: NextRequest) {
    await connectDB();
    const order = await Order.find().sort({ createdAt: -1 });

    return NextResponse.json(order);
}
