import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/entities/models/db/mongoose";
import Cart from "@/src/entities/models/Cart";
import { getServerSession } from "next-auth";
import { authOptions } from "../../src/shared/lib/auth";

const POST = async (req: NextRequest) => {
    const body = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
        return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
    }

    await connectDB();

    for (const item of body) {
        await Cart.create({
            ...item,
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    return NextResponse.json({ ok: true });
};

const GET = async () => {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.email;

    if (!userId) {
        return NextResponse.json([], { status: 200 });
    }

    const cartItems = await Cart.find({ userId }).lean();
    return NextResponse.json(cartItems);
};

export { POST, GET };
