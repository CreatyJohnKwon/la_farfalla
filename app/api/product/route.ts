import { connectDB } from "@src/entities/models/db/mongoose";
import Product from "@/src/entities/models/Product";
import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

const GET = async (req: NextRequest) => {
    try {
        await connectDB();

        const productId = req.nextUrl.searchParams.get("productId");
        const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
        const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);

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

        const products = await Product.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

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

        const {
            title,
            description,
            price,
            discount,
            image,
            seasonName,
            size,
            options, // 새로운 방식: options 배열 사용
        } = body;

        // 기본 필수 필드 검증
        if (
            !title ||
            !description ||
            !price ||
            !image ||
            !options ||
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
            !Array.isArray(size) ||
            !Array.isArray(description.images) ||
            !Array.isArray(options)
        ) {
            return NextResponse.json(
                {
                    error: "image, size, description.images, options는 배열이어야 합니다.",
                },
                { status: 400 },
            );
        }

        // options 배열 검증
        if (options.length === 0) {
            return NextResponse.json(
                { error: "최소 1개 이상의 옵션이 필요합니다." },
                { status: 400 },
            );
        }

        // ✅ options 배열 내용 검증 (optionNumber 제거)
        for (const option of options) {
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
        const totalQuantity = options.reduce((sum, option) => {
            return sum + (Number(option.stockQuantity) || 0);
        }, 0);

        const colors = [...new Set(options.map((option) => option.colorName))];

        const newProduct = new Product({
            title,
            description,
            price,
            discount: discount || "0",
            image,
            seasonName: seasonName ?? "",
            size,

            // 새로운 방식: options 배열 직접 저장
            options,

            // 호환성을 위한 기존 필드들
            colors,
            quantity: totalQuantity.toString(),
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
            seasonName,
            size,
            options, // 새로운 방식: options 배열 사용
        } = body;

        // options 배열이 있는 경우 검증
        if (options && Array.isArray(options)) {
            if (options.length === 0) {
                return NextResponse.json(
                    { error: "최소 1개 이상의 옵션이 필요합니다." },
                    { status: 400 },
                );
            }

            // ✅ options 배열 내용 검증 (optionNumber 제거)
            for (const option of options) {
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

        // 업데이트할 데이터 준비
        const updateData: any = {
            title,
            description,
            price,
            discount: discount || "0",
            image,
            seasonName: seasonName ?? "",
            size,
        };

        // options가 있으면 새로운 방식으로 처리
        if (options && Array.isArray(options)) {
            // options에서 총 수량과 색상 배열 계산
            const totalQuantity = options.reduce((sum, option) => {
                return sum + (Number(option.stockQuantity) || 0);
            }, 0);

            const colors = [
                ...new Set(options.map((option) => option.colorName)),
            ];

            updateData.options = options;
            updateData.colors = colors; // 호환성
            updateData.quantity = totalQuantity.toString(); // 호환성
        } else {
            // options가 없으면 기존 방식 (하위 호환성)
            if (body.colors) updateData.colors = body.colors;
            if (body.quantity) updateData.quantity = body.quantity;
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            updateData,
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
