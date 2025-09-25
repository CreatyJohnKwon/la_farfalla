import { connectDB } from "@src/entities/models/db/mongoose";
import Product from "@src/entities/models/Product";
import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId, Types } from "mongoose";
import Category from "@/src/entities/models/Category";

const GET = async (req: NextRequest) => {
    try {
        await connectDB();

        const productId = req.nextUrl.searchParams.get("productId");
        const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
        const limit = parseInt(req.nextUrl.searchParams.get("limit") || "9", 10);

        if (productId) {
            if (!isValidObjectId(productId)) {
                return NextResponse.json(
                    { error: "올바른 productId가 필요합니다." },
                    { status: 400 },
                );
            }

            const productItem = await Product.findById(productId).lean();

            if (!productItem) {
                return NextResponse.json(
                    { error: "Product not found" },
                    { status: 404 },
                );
            }

            return NextResponse.json(productItem);
        }

        const skip = (page - 1) * limit;

        // 1. 상품 목록 조회
        const products = await Product.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Product.countDocuments();

        return NextResponse.json({
            data: products,
            total,
            hasMore: skip + products.length < total,
        });
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

        const { otherProductData } = body;

        // 기본 필수 필드 검증
        if (
            !otherProductData.title ||
            !otherProductData.description ||
            !otherProductData.price ||
            !otherProductData.image ||
            !otherProductData.options ||
            !otherProductData.categories ||
            otherProductData.size === undefined ||
            otherProductData.title.kr === undefined ||
            otherProductData.description.images === undefined ||
            otherProductData.description.text === undefined
        ) {
            return NextResponse.json(
                { error: "모든 필수 필드를 정확히 입력해야 합니다." },
                { status: 400 },
            );
        }

        // 배열 데이터 유효성 검사
        if (
            !Array.isArray(otherProductData.image) ||
            !Array.isArray(otherProductData.size) ||
            !Array.isArray(otherProductData.description.images) ||
            !Array.isArray(otherProductData.categories) ||
            !Array.isArray(otherProductData.options)
        ) {
            return NextResponse.json(
                {
                    error: "image, size, description.images, options는 배열이어야 합니다.",
                },
                { status: 400 },
            );
        }

        // options 배열 검증
        if (otherProductData.options.length === 0) {
            return NextResponse.json(
                { error: "최소 1개 이상의 옵션이 필요합니다." },
                { status: 400 },
            );
        }

        // ✅ options 배열 내용 검증 (optionNumber 제거)
        for (const option of otherProductData.options) {
            if (!option.colorName || option.stockQuantity === undefined) {
                return NextResponse.json(
                    {
                        error: "옵션의 colorName, stockQuantity는 필수입니다.",
                    },
                    { status: 400 },
                );
            }
        }

        await connectDB();

        // options에서 총 수량과 색상 배열 계산
        const totalQuantity = otherProductData.options.reduce((sum: number, option: any) => {
            return sum + (Number(option.stockQuantity) || 0);
        }, 0).toString();

        const colors = [...new Set(otherProductData.options.map((option: { colorName: string }) => option.colorName))];

        const newProduct = new Product({
            ...otherProductData,
            colors,
            quantity: totalQuantity,
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

        const { ...otherProductData } = body;

        // options 배열이 있는 경우 검증
        if (otherProductData.options && Array.isArray(otherProductData.options)) {
            if (otherProductData.options.length === 0) {
                return NextResponse.json(
                    { error: "최소 1개 이상의 옵션이 필요합니다." },
                    { status: 400 },
                );
            }

            // ✅ options 배열 내용 검증 (optionNumber 제거)
            for (const option of otherProductData.options) {
                if (!option.colorName || option.stockQuantity === undefined) {
                    return NextResponse.json(
                        {
                            error: "옵션의 colorName, stockQuantity는 필수입니다.",
                        },
                        { status: 400 },
                    );
                }
            }
        }

        await connectDB();

        // 업데이트할 데이터를 준비합니다.
        const updateData: any = { ...otherProductData };

        if (updateData.options && Array.isArray(updateData.options)) {
            const totalQuantity = updateData.options.reduce((sum: number, option: any) => sum + (Number(option.stockQuantity) || 0), 0);
            const colors = [...new Set(updateData.options.map((option: any) => option.colorName))];
            updateData.colors = colors;
            updateData.quantity = totalQuantity.toString();
        }

        // ✅ `$set` 연산자를 사용하여 필드를 명시적으로 덮어쓰도록 지시합니다.
        // 이렇게 하면 배열이 실수로 병합되는 현상을 완벽하게 방지할 수 있습니다.
        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updateData }, // updateData 객체를 $set으로 감쌉니다.
            {
                new: true, // 업데이트된 후의 문서를 반환
                runValidators: true, // 스키마 유효성 검사 실행
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
