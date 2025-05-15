// app/api/cart/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/entities/models/db/mongoose";
import CartModel from "@/src/entities/models/Cart";

export async function POST(req: NextRequest) {
    const body = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
        return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
    }

    await connectDB();

    for (const item of body) {
        await CartModel.create({
            ...item,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    return NextResponse.json({ ok: true });
}
