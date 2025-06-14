import { connectDB } from "@src/entities/models/db/mongoose";
import Product from "@/src/entities/models/Product";
import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

const GET = async (req: NextRequest) => {
    try {
        const productId = req.nextUrl.searchParams.get("productId");

        if (!productId || !isValidObjectId(productId)) {
            return NextResponse.json(
                { error: "올바른 userId가 필요합니다." },
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
            seasonId,
            size,
        } = body;

        // 필수 필드 검증
        if (
            !title ||
            !description ||
            !price ||
            !image ||
            !colors ||
            !seasonId ||
            !size
        ) {
            return NextResponse.json(
                { error: "모든 필수 필드를 입력해야 합니다." },
                { status: 400 },
            );
        }

        await connectDB();

        const newProduct = new Product({
            title,
            description,
            price,
            discount: discount || "0", // 선택 필드 기본값 처리
            image,
            colors,
            seasonId,
            size,
        });

        const savedProduct = await newProduct.save();

        return NextResponse.json(savedProduct, { status: 201 });
    } catch (err) {
        console.error("POST Error:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
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
            seasonId,
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
                seasonId,
                size,
            },
            {
                new: true, // 수정된 문서를 반환
                runValidators: true, // Mongoose 스키마 validation 수행
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

export { GET, POST, PUT };
