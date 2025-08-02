import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Cart } from "@src/entities/models/Cart";
import { getServerSession } from "next-auth";
import { authOptions } from "../../src/shared/lib/auth";

const POST = async (req: NextRequest) => {
    const body = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
        return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
    }

    await connectDB();

    for (const item of body) {
        const { userId, productId, size, color, quantity } = item;

        const existingItem = await Cart.findOne({
            userId,
            productId,
            size,
            color,
        });

        if (existingItem) {
            // 이미 있으면 수량만 업데이트
            existingItem.quantity += quantity;
            existingItem.updatedAt = new Date();
            await existingItem.save();
        } else {
            // 없으면 새로 생성
            await Cart.create({
                ...item,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
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

const PATCH = async (req: NextRequest) => {
    try {
        const body = await req.json();

        const { userId, productId, size, color, quantity } = body;

        if (!userId || !productId || !size || !color || !quantity) {
            return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
        }

        await connectDB();

        const updated = await Cart.findOneAndUpdate(
            { userId, productId, size, color },
            {
                $set: { quantity, updatedAt: new Date() },
                $setOnInsert: { createdAt: new Date() },
            },
            { upsert: true, new: true },
        );

        return NextResponse.json({ ok: true, item: updated });
    } catch (error) {
        console.error("PATCH error:", error);
        return NextResponse.json({ error: "서버 오류" }, { status: 500 });
    }
};

const DELETE = async (req: NextRequest) => {
    const body = await req.json();
    const ids = body?.ids; // 배열로 받음: 확장가능성 염두 (모두선택 삭제 대비)

    if (!Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
            { error: "삭제할 id가 없습니다" },
            { status: 400 },
        );
    }

    await connectDB();

    // 한 번에 삭제
    await Cart.deleteMany({ _id: { $in: ids } });

    return NextResponse.json({ ok: true });
};

export { POST, GET, DELETE, PATCH };
