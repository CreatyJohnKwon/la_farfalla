import { connectDB } from "@src/entities/models/db/mongoose";
import Product from "@/src/entities/models/Product";
import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

const GET = async (req: NextRequest) => {
    try {
        const productId = req.nextUrl.searchParams.get("productId");

        if (!productId || !isValidObjectId(productId)) {
            return NextResponse.json(
                { error: "올바른 productId가 필요합니다." },
                { status: 400 },
            );
        }

        await connectDB();

        const productItem = await Product.findById(productId).lean();

        if (!productItem) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(productItem);
    } catch (err) {
        console.error("Error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
};

const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();

        const {
            title,
            description,
            price,
            discount,
            image,
            colors,
            seasonName,
            size,
        } = body;

        // 기본 필수 필드 검증
        if (
            !title ||
            !description ||
            !price ||
            !image ||
            !colors ||
            size === undefined ||
            title.kr === undefined ||
            description.images === undefined ||
            description.text === undefined
        ) {
            return NextResponse.json(
                { error: "모든 필수 필드를 정확히 입력해야 합니다." },
                { status: 400 },
            );
        }

        // 배열 데이터 유효성 검사
        if (
            !Array.isArray(image) ||
            !Array.isArray(colors) ||
            !Array.isArray(size) ||
            !Array.isArray(description.images)
        ) {
            return NextResponse.json(
                {
                    error: "image, colors, size, description.images는 배열이어야 합니다.",
                },
                { status: 400 },
            );
        }

        await connectDB();

        const newProduct = new Product({
            title,
            description,
            price,
            discount: discount || "0",
            image,
            colors,
            seasonName: seasonName ?? "",
            size,
        });

        const savedProduct = await newProduct.save();

        return NextResponse.json(savedProduct, { status: 201 });
    } catch (err: any) {
        console.error("POST Error:", err);
        console.error("유효성 검사 에러:", err.errors);
        return NextResponse.json(
            { error: "Internal Server Error", details: err.message },
            { status: 500 },
        );
    }
};

const PUT = async (req: NextRequest) => {
    try {
        const productId = req.nextUrl.searchParams.get("productId");

        if (!productId || !isValidObjectId(productId)) {
            return NextResponse.json(
                { error: "올바른 productId가 필요합니다." },
                { status: 400 },
            );
        }

        const body = await req.json();

        const {
            title,
            description,
            price,
            discount,
            image,
            colors,
            seasonName,
            size,
        } = body;

        await connectDB();

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            {
                title,
                description,
                price,
                discount: discount || "0",
                image,
                colors,
                seasonName: seasonName ?? "", // 빈 문자열 허용
                size,
            },
            {
                new: true,
                runValidators: true,
            },
        ).lean();

        if (!updatedProduct) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(updatedProduct, { status: 200 });
    } catch (err) {
        console.error("PUT Error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
};

const DELETE = async (req: NextRequest) => {
    try {
        const productId = req.nextUrl.searchParams.get("productId");

        if (!productId || !isValidObjectId(productId)) {
            return NextResponse.json(
                { error: "올바른 productId가 필요합니다." },
                { status: 400 },
            );
        }

        await connectDB();

        await Product.deleteOne({ _id: productId });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("DELETE Error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 },
        );
    }
};

export { GET, POST, PUT, DELETE };
