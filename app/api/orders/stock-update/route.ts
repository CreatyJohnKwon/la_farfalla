import { connectDB } from "@/src/entities/models/db/mongoose";
import { NextRequest, NextResponse } from "next/server";
import Product from "@/src/entities/models/Product";
import { Types } from "mongoose";

class ObjectIdUtils {
    static isValidObjectId(id: any): boolean {
        if (!id) return false;
        if (id instanceof Types.ObjectId) return true;
        if (typeof id === "string") {
            return Types.ObjectId.isValid(id);
        }
        return false;
    }

    static toObjectIdStrict(id: any): Types.ObjectId {
        if (!id) {
            throw new Error("ID가 제공되지 않았습니다");
        }

        if (id instanceof Types.ObjectId) {
            return id;
        }

        if (typeof id === "string") {
            if (!Types.ObjectId.isValid(id)) {
                throw new Error(`유효하지 않은 ObjectId 형식: ${id}`);
            }
            return new Types.ObjectId(id);
        }

        throw new Error(`지원하지 않는 ID 타입: ${typeof id}`);
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { items, action, productId, orderId } = await request.json();

        // 입력 데이터 검증
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { error: "Items array is required" },
                { status: 400 },
            );
        }

        if (!action || (action !== "reduce" && action !== "restore")) {
            return NextResponse.json(
                { error: "Action is required. Use 'reduce' or 'restore'" },
                { status: 400 },
            );
        }

        // Mongoose DB 연결
        await connectDB();

        const updates = [];

        // 각 아이템의 재고 업데이트
        for (const item of items) {
            const quantity = item.stockQuantity || 1;
            const targetProductId = item.productId || productId;

            if (!targetProductId) {
                return NextResponse.json(
                    { error: "ProductId is required" },
                    { status: 400 },
                );
            }

            // ObjectId 변환
            let productObjectId: Types.ObjectId;

            try {
                if (!ObjectIdUtils.isValidObjectId(targetProductId)) {
                    return NextResponse.json(
                        {
                            error: `유효하지 않은 ProductId 형식: ${targetProductId}`,
                            details:
                                "ObjectId는 24자리 16진수 문자열이어야 합니다",
                        },
                        { status: 400 },
                    );
                }

                productObjectId =
                    ObjectIdUtils.toObjectIdStrict(targetProductId);
                console.log(
                    `✅ ObjectId 변환 성공: ${targetProductId} → ${productObjectId}`,
                );
            } catch (objectIdError: any) {
                console.error("ObjectId 변환 실패:", objectIdError);
                return NextResponse.json(
                    {
                        error: "ProductId 변환 실패",
                        details: objectIdError.message,
                    },
                    { status: 400 },
                );
            }

            try {
                // 상품 조회
                const product = await Product.findById(productObjectId);

                if (!product) {
                    return NextResponse.json(
                        {
                            error: `Product not found: ${targetProductId}`,
                            details: "해당 ID의 상품이 존재하지 않습니다",
                        },
                        { status: 404 },
                    );
                }

                console.log(
                    `📦 상품 조회 성공: ${product.title.kr} (ID: ${productObjectId})`,
                );

                // 🔍 options 배열에서 해당 colorName 찾기
                const optionIndex = product.options.findIndex(
                    (option: any) => option.colorName === item.colorName,
                );

                if (optionIndex === -1) {
                    return NextResponse.json(
                        {
                            error: `Color option not found: ${item.colorName}`,
                            details: `상품 '${product.title.kr}'에 '${item.colorName}' 색상 옵션이 없습니다`,
                            availableColors: product.options.map(
                                (opt: any) => opt.colorName,
                            ),
                        },
                        { status: 404 },
                    );
                }

                const currentOption = product.options[optionIndex];
                const currentStock = currentOption.stockQuantity || 0;

                console.log(
                    `📊 현재 재고: ${item.colorName} = ${currentStock}`,
                );

                let newStock;

                if (action === "reduce") {
                    // 재고 차감 - 재고 부족 체크
                    if (currentStock < quantity) {
                        return NextResponse.json(
                            {
                                error: `재고 부족: ${product.title.kr} ${item.colorName}`,
                                details: `현재 재고: ${currentStock}, 요청 수량: ${quantity}`,
                                productId: targetProductId,
                                colorName: item.colorName,
                                availableStock: currentStock,
                                requestedQuantity: quantity,
                            },
                            { status: 400 },
                        );
                    }
                    newStock = currentStock - quantity;
                    console.log(
                        `⬇️ 재고 차감: ${currentStock} - ${quantity} = ${newStock}`,
                    );
                } else {
                    // 재고 복구
                    newStock = currentStock + quantity;
                    console.log(
                        `⬆️ 재고 복구: ${currentStock} + ${quantity} = ${newStock}`,
                    );
                }

                // 🔄 MongoDB 배열 요소 업데이트 (positional operator 사용)
                try {
                    // 1단계: 개별 옵션 재고 업데이트
                    const updateResult = await Product.findOneAndUpdate(
                        {
                            _id: productObjectId,
                            "options.colorName": item.colorName,
                        },
                        {
                            $set: {
                                "options.$.stockQuantity": newStock,
                            },
                        },
                        {
                            new: true,
                            runValidators: true,
                        },
                    );

                    if (!updateResult) {
                        throw new Error("상품 재고 업데이트에 실패했습니다");
                    }

                    console.log(
                        `✅ 개별 재고 업데이트 성공: ${item.colorName} = ${newStock}`,
                    );

                    // 2단계: 전체 재고량(quantity) 재계산 및 업데이트
                    const totalQuantity = updateResult.options.reduce(
                        (sum: number, option: any) => {
                            return sum + (Number(option.stockQuantity) || 0);
                        },
                        0,
                    );

                    // 3단계: quantity 필드 업데이트
                    const finalUpdateResult = await Product.findByIdAndUpdate(
                        productObjectId,
                        {
                            $set: {
                                quantity: totalQuantity.toString(),
                            },
                        },
                        {
                            new: true,
                            runValidators: true,
                        },
                    );

                    if (!finalUpdateResult) {
                        throw new Error("전체 수량 업데이트에 실패했습니다");
                    }

                    console.log(
                        `🔢 전체 수량 업데이트 성공: ${totalQuantity} (이전: ${updateResult.quantity})`,
                    );

                    // 4단계: 각 색상별 재고 현황 로그 (디버깅용)
                    console.log(`📊 색상별 재고 현황:`);
                    finalUpdateResult.options.forEach(
                        (opt: any, idx: number) => {
                            console.log(
                                `   ${idx + 1}. ${opt.colorName}: ${opt.stockQuantity}개`,
                            );
                        },
                    );
                    console.log(
                        `📦 총 재고량: ${finalUpdateResult.quantity}개`,
                    );
                } catch (updateError: any) {
                    console.error("재고 업데이트 실패:", updateError);
                    return NextResponse.json(
                        {
                            error: "Failed to update stock",
                            details: updateError.message,
                            productId: targetProductId,
                            colorName: item.colorName,
                        },
                        { status: 500 },
                    );
                }

                // 📝 재고 로그 기록 (선택사항)
                try {
                    // StockLog 모델이 있다면 기록
                    console.log(
                        `📝 재고 변경 로그: ${product.title.kr} ${item.colorName} ${action} ${quantity}`,
                    );
                } catch (logError: any) {
                    console.warn("❌ 재고 로그 기록 실패:", logError.message);
                }

                updates.push({
                    productId: targetProductId,
                    productName: product.title.kr,
                    colorName: item.colorName,
                    previousStock: currentStock,
                    newStock,
                    quantity,
                    optionIndex, // 디버깅용
                });
            } catch (findError: any) {
                console.error("상품 조회 실패:", findError);
                return NextResponse.json(
                    {
                        error: "Failed to find product",
                        details: findError.message,
                        productId: targetProductId,
                    },
                    { status: 500 },
                );
            }
        }

        // 🎉 성공 응답
        const response = {
            success: true,
            message: action === "reduce" ? "재고 차감 완료" : "재고 복구 완료",
            action,
            itemsProcessed: updates.length,
            updates,
            timestamp: new Date().toISOString(),
        };

        console.log(`🎉 재고 업데이트 완료:`, response);

        return NextResponse.json(response);
    } catch (error: any) {
        console.error("❌ 재고 업데이트 실패:", error);
        return NextResponse.json(
            {
                error: "재고 업데이트 실패",
                details: error.message,
                timestamp: new Date().toISOString(),
            },
            { status: 500 },
        );
    }
}
