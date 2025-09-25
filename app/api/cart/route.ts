import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Cart } from "@src/entities/models/Cart";
import { getServerSession } from "next-auth";
import { authOptions } from "@src/shared/lib/auth";

const GET = async () => {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id;

    if (!userId) {
        return NextResponse.json([], { status: 200 });
    }

    const cartItems = await Cart.find({ userId }).lean();
    return NextResponse.json(cartItems);
};

const POST = async (req: NextRequest) => {
    const body = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
        return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
    }

    for (const item of body) {
        const { userId, productId, size, color, quantity } = item;

        if (!userId || !productId || !quantity) {
            return NextResponse.json(
                { error: "배열의 항목에 필수 정보가 누락되었습니다.", invalidItem: item },
                { status: 400 },
            );
        }

        const isStandardProduct = size && color;
        const isAdditionalOption = !size && !color;

        if (!isStandardProduct && !isAdditionalOption) {
            return NextResponse.json(
                { error: "배열에 잘못된 옵션 정보를 가진 항목이 있습니다.", invalidItem: item },
                { status: 400 },
            );
        }
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
            existingItem.quantity += quantity;
            existingItem.updatedAt = new Date();
            await existingItem.save();
        } else {
            await Cart.create({
                ...item,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }
    }

    return NextResponse.json({ ok: true });
};

const PATCH = async (req: NextRequest) => {
    try {
        const body = await req.json();

        const { userId, productId, size, color, quantity } = body;

        if (!userId || !productId || !quantity) {
            return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 });
        }

        const isStandardProduct = size && color; // size와 color가 둘 다 존재
        const isAdditionalOption = !size && !color; // size와 color가 둘 다 존재하지 않음

        if (!isStandardProduct && !isAdditionalOption) {
            return NextResponse.json(
                { error: "옵션 정보가 잘못되었습니다. (사이즈와 색상은 함께 선택하거나 모두 선택하지 않아야 합니다.)" },
                { status: 400 },
            );
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
