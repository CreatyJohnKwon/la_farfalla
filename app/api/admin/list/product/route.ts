import { connectDB } from "@/src/entities/models/db/mongoose";
import Product from "@/src/entities/models/Product";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await connectDB();
    const product = await Product.find().sort({ createdAt: -1 });

    return NextResponse.json(product);
}
