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
        const isAdmin = req.nextUrl.searchParams.get("isAdmin") === "true";

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

        const filter: any = {};
        if (!isAdmin) {
            // 관리자가 아닌 경우, 공개된 상품만 필터링
            filter.visible = true;
        }

        // 1. 상품 목록 조회
        const products = await Product.find(filter)
            .sort({ index: 1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Product.countDocuments(filter);

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
            productData.description.items === undefined || 
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
            !Array.isArray(productData.description.items) ||
            !Array.isArray(productData.categories) ||
            !Array.isArray(productData.options)
        ) {
            return NextResponse.json(
                {
                    error: "image, size, description.items, options는 배열이어야 합니다.",
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

        // description 배열 검증
        for (const item of productData.description.items) {
            if (!item.itemType || !['image', 'break'].includes(item.itemType)) {
                return NextResponse.json({ error: "description.items의 itemType이 올바르지 않습니다." }, { status: 400 });
            }
            if (item.itemType === 'image' && (!item.src || typeof item.src !== 'string')) {
                return NextResponse.json({ error: "itemType이 'image'인 경우 src는 필수 문자열입니다." }, { status: 400 });
            }
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
            if (!Array.isArray(productData.additionalOptions)) {
                return NextResponse.json(
                    { error: "additionalOptions는 배열이어야 합니다." },
                    { status: 400 },
                );
            }

            for (const addOption of productData.additionalOptions) {
                if (!addOption.name || typeof addOption.name !== 'string') {
                    return NextResponse.json(
                        { error: "추가 옵션의 이름(name)은 필수 문자열입니다." },
                        { status: 400 },
                    );
                }
                if (addOption.additionalPrice === undefined || typeof addOption.additionalPrice !== 'number') {
                     return NextResponse.json(
                        { error: "추가 옵션의 추가금액(additionalPrice)은 필수 숫자입니다." },
                        { status: 400 },
                    );
                }
                // 👇 stockQuantity 유효성 검사 추가
                if (addOption.stockQuantity === undefined || typeof addOption.stockQuantity !== 'number') {
                    return NextResponse.json(
                       { error: "추가 옵션의 재고(stockQuantity)는 필수 숫자입니다." },
                       { status: 400 },
                   );
               }
            }
        }

        await connectDB();

        const newProduct = new Product(productData);
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

// 상품 순서 일괄 업데이트
const PATCH = async (req: NextRequest) => {
    try {
        await connectDB();
        const body = await req.json();

        // 데이터 유효성 검사
        if (Array.isArray(body)) {
            const productsOrder: { _id: string; index: number }[] = body;
            const operations = productsOrder.map(({ _id, index }) => ({
                updateOne: { filter: { _id }, update: { $set: { index } } },
            }));
            await Product.bulkWrite(operations);
            return NextResponse.json({ success: true, message: "상품 순서가 업데이트되었습니다." });
        }

        const { productId, visible } = body;
        if (productId && typeof visible === "boolean") {
        if (!isValidObjectId(productId)) {
                return NextResponse.json({ error: "올바른 productId가 필요합니다." }, { status: 400 });
            }
            await Product.findByIdAndUpdate(productId, { $set: { visible } });
            return NextResponse.json({ success: true, message: "공개 상태가 업데이트되었습니다." });
        }

        return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
    } catch (err) {
        console.error("PATCH Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

const PUT = async (req: NextRequest) => {
    try {
        const productId = req.nextUrl.searchParams.get("productId");

        if (!productId || !isValidObjectId(productId)) {
            return NextResponse.json({ error: "올바른 productId가 필요합니다." }, { status: 400 });
        }

        const productData = await req.json();

        // description 배열 검증
        if (productData.description && productData.description.items) {
            if (!Array.isArray(productData.description.items)) {
                return NextResponse.json({ error: "description.items는 배열이어야 합니다." }, { status: 400 });
            }

            for (const item of productData.description.items) {
                if (!item.itemType || !['image', 'break'].includes(item.itemType)) {
                    return NextResponse.json({ error: "description.items의 itemType이 올바르지 않습니다." }, { status: 400 });
                }
                if (item.itemType === 'image' && (!item.src || typeof item.src !== 'string')) {
                    return NextResponse.json({ error: "itemType이 'image'인 경우 src는 필수 문자열입니다." }, { status: 400 });
                }
            }
        }

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
            if (!Array.isArray(productData.additionalOptions)) {
                return NextResponse.json(
                    { error: "additionalOptions는 배열이어야 합니다." },
                    { status: 400 },
                );
            }
            
            for (const addOption of productData.additionalOptions) {
                if (!addOption.name || typeof addOption.name !== 'string') {
                    return NextResponse.json(
                        { error: "추가 옵션의 이름(name)은 필수 문자열입니다." },
                        { status: 400 },
                    );
                }
                 if (addOption.additionalPrice === undefined || typeof addOption.additionalPrice !== 'number') {
                     return NextResponse.json(
                        { error: "추가 옵션의 추가금액(additionalPrice)은 필수 숫자입니다." },
                        { status: 400 },
                    );
                }
                // 👇 stockQuantity 유효성 검사 추가
                if (addOption.stockQuantity === undefined || typeof addOption.stockQuantity !== 'number') {
                    return NextResponse.json(
                       { error: "추가 옵션의 재고(stockQuantity)는 필수 숫자입니다." },
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
            { $set: productData }, // $set을 사용하여 받은 데이터 전체를 업데이트
            { new: true, runValidators: true }, // new: true로 업데이트된 문서를 반환, runValidators: true로 스키마 유효성 검사 실행
        ).lean();

        if (!updatedProduct) {
            return NextResponse.json({ success: false, message: "상품을 찾을 수 없습니다." }, { status: 404 });
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

export { GET, POST, PATCH, PUT, DELETE };
