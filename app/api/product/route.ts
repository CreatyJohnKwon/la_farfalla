import { connectDB } from "@src/entities/models/db/mongoose";
import Product from "@src/entities/models/Product";
import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";

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
        const productData = await req.json();

        // 기본 필수 필드 검증
        if (
            !productData.title ||
            !productData.description ||
            !productData.price ||
            !productData.image ||
            !productData.options ||
            !productData.categories ||
            productData.size === undefined ||
            productData.title.kr === undefined ||
            productData.description.images === undefined ||
            productData.description.text === undefined
        ) {
            return NextResponse.json(
                { error: "모든 필수 필드를 정확히 입력해야 합니다." },
                { status: 400 },
            );
        }

        // 배열 데이터 유효성 검사
        if (
            !Array.isArray(productData.image) ||
            !Array.isArray(productData.size) ||
            !Array.isArray(productData.description.images) ||
            !Array.isArray(productData.categories) ||
            !Array.isArray(productData.options)
        ) {
            return NextResponse.json(
                {
                    error: "image, size, description.images, options는 배열이어야 합니다.",
                },
                { status: 400 },
            );
        }

        // options 배열 검증
        if (productData.options.length === 0) {
            return NextResponse.json(
                { error: "최소 1개 이상의 옵션이 필요합니다." },
                { status: 400 },
            );
        }

        // ✅ options 배열 내용 검증 (optionNumber 제거)
        for (const option of productData.options) {
            if (!option.colorName || option.stockQuantity === undefined) {
                return NextResponse.json(
                    {
                        error: "옵션의 colorName, stockQuantity는 필수입니다.",
                    },
                    { status: 400 },
                );
            }
        }

        // 추가 옵션 배열 검증
        if (
            productData.additionalOptions &&
            !Array.isArray(productData.additionalOptions)
        ) {
            return NextResponse.json(
                { error: "additionalOptions는 배열이어야 합니다." },
                { status: 400 },
            );
        }

        // 추가 옵션 내용 검증
        if (productData.additionalOptions) {
            for (const addOption of productData.additionalOptions) {
                if (!addOption.name || typeof addOption.name !== 'string') {
                    return NextResponse.json(
                        { error: "추가 옵션의 이름(name)은 필수 문자열입니다." },
                        { status: 400 },
                    );
                }
                if (addOption.additionalPrice && typeof addOption.additionalPrice !== 'number') {
                     return NextResponse.json(
                        { error: "추가 옵션의 추가금액(additionalPrice)은 숫자여야 합니다." },
                        { status: 400 },
                    );
                }
            }
        }

        await connectDB();

        // options에서 총 수량과 색상 배열 계산
        const totalQuantity = productData.options.reduce((sum: number, option: any) => {
            return sum + (Number(option.stockQuantity) || 0);
        }, 0).toString();

        const colors = [...new Set(productData.options.map((option: { colorName: string }) => option.colorName))];

        const newProduct = new Product({
            ...productData,
            colors,
            quantity: totalQuantity,
            additionalOptions: productData.additionalOptions || [], // 추가 옵션 필드 할당
        });

        const savedProduct = await newProduct.save();

        savedProduct.message = "상품 생성 성공";

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

        const productData = await req.json();

        // options 배열이 있는 경우 검증
        if (productData.options && Array.isArray(productData.options)) {
            if (productData.options.length === 0) {
                return NextResponse.json(
                    { error: "최소 1개 이상의 옵션이 필요합니다." },
                    { status: 400 },
                );
            }

            // ✅ options 배열 내용 검증 (optionNumber 제거)
            for (const option of productData.options) {
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

        // 추가 옵션 배열 검증
        if (
            productData.additionalOptions &&
            !Array.isArray(productData.additionalOptions)
        ) {
            return NextResponse.json(
                { error: "additionalOptions는 배열이어야 합니다." },
                { status: 400 },
            );
        }

        // 추가 옵션 내용 검증
        if (productData.additionalOptions) {
            for (const addOption of productData.additionalOptions) {
                if (!addOption.name || typeof addOption.name !== 'string') {
                    return NextResponse.json(
                        { error: "추가 옵션의 이름(name)은 필수 문자열입니다." },
                        { status: 400 },
                    );
                }
                 if (addOption.additionalPrice && typeof addOption.additionalPrice !== 'number') {
                     return NextResponse.json(
                        { error: "추가 옵션의 추가금액(additionalPrice)은 숫자여야 합니다." },
                        { status: 400 },
                    );
                }
            }
        }

        await connectDB();

        // 업데이트할 데이터를 준비합니다.
        const updateData: any = { ...productData };

        if (updateData.options && Array.isArray(updateData.options)) {
            const totalQuantity = updateData.options.reduce((sum: number, option: any) => sum + (Number(option.stockQuantity) || 0), 0);
            const colors = [...new Set(updateData.options.map((option: any) => option.colorName))];
            updateData.colors = colors;
            updateData.quantity = totalQuantity.toString();
        }

        // additionalOptions 필드도 업데이트에 포함
        if (updateData.additionalOptions) {
            updateData.additionalOptions = productData.additionalOptions;
        } else {
            // 만약 요청에 additionalOptions가 없다면 빈 배열로 설정
            updateData.additionalOptions = [];
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            productId,
            { $set: updateData },
            { new: true, runValidators: true },
        ).lean();

        if (!updatedProduct) {
            return NextResponse.json(
                { success: false, message: "상품을 찾을 수 없습니다." },
                { status: 404 },
            );
        }

        updateData.memsage = "상품 수정 성공";
        updateData.success = true;

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
