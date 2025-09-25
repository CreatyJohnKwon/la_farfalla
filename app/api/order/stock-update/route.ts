import { NextRequest, NextResponse } from "next/server";
import Product from "@/src/entities/models/Product";
import mongoose from "mongoose";

export async function PUT(request: NextRequest) {
    const session = await mongoose.startSession();

    try {
        const { items, action } = await request.json();

        // --- 1. 입력 데이터 사전 검증 ---
        if (!action || (action !== "reduce" && action !== "restore")) {
            return NextResponse.json({ error: "Action은 'reduce' 또는 'restore'여야 합니다." }, { status: 400 });
        }
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "업데이트할 items 배열이 필요합니다." }, { status: 400 });
        }

        // 각 아이템의 구조 유효성 검사
        for (const item of items) {
            const isStandardProduct = item.size && item.color && !item.additional;
            const isAdditionalOption = !item.size && !item.color && item.additional;
            if (!isStandardProduct && !isAdditionalOption) {
                return NextResponse.json(
                    { error: "잘못된 옵션 조합을 가진 아이템이 있습니다.", invalidItem: item },
                    { status: 400 }
                );
            }
        }

        let responseMessage = "";
        
        await session.withTransaction(async () => {
            // --- 2. DB 업데이트를 위한 Operation 배열 생성 ---
            const stockOperations = items.map(item => {
                const quantity = Number(item.quantity) || 1;
                // 재고 차감 시에는 음수, 복구 시에는 양수
                const operationQuantity = action === 'reduce' ? -quantity : quantity;

                // [분기 1] 일반 상품 (size와 color 존재)
                if (item.size && item.color) {
                    const filter: mongoose.FilterQuery<any> = {
                        _id: item.productId,
                        "options.colorName": item.color,
                    };
                    // 재고 차감 시에만 재고 부족 여부 확인
                    if (action === 'reduce') {
                        filter["options.stockQuantity"] = { $gte: quantity };
                    }
                    return {
                        updateOne: {
                            filter,
                            update: { $inc: { "options.$.stockQuantity": operationQuantity } }
                        }
                    };
                }
                // [분기 2] 추가 옵션 상품 (additional 존재)
                else {
                    const filter: mongoose.FilterQuery<any> = {
                        _id: item.productId,
                        "additionalOptions.name": item.additional,
                    };
                    // 재고 차감 시에만 재고 부족 여부 확인
                    if (action === 'reduce') {
                        filter["additionalOptions.stockQuantity"] = { $gte: quantity };
                    }
                    return {
                        updateOne: {
                            filter,
                            update: { $inc: { "additionalOptions.$.stockQuantity": operationQuantity } }
                        }
                    };
                }
            });

            // --- 3. bulkWrite로 모든 재고 업데이트를 한 번에 실행 ---
            const result = await Product.bulkWrite(stockOperations, { session });

            // 재고 차감 시, 요청한 수만큼 업데이트되지 않았다면 재고 부족으로 간주
            if (action === 'reduce' && result.modifiedCount < items.length) {
                // 트랜잭션이 자동으로 롤백됨
                throw new Error("일부 상품의 재고가 부족하여 작업을 중단했습니다.");
            }

            // --- 4. 일반 상품에 한해 최상위 quantity 재계산 ---
            const standardProductItems = items.filter(item => item.size && item.color);
            const uniqueProductIds = [...new Set(standardProductItems.map(item => item.productId))];

            for (const productId of uniqueProductIds) {
                const product = await Product.findById(productId).session(session);
                if (!product) continue;
                
                const totalQuantity = product.options.reduce((sum: number, option: any) => sum + (option.stockQuantity || 0), 0);
                product.quantity = totalQuantity.toString();
                await product.save({ session });
            }

            responseMessage = action === "reduce" ? "재고 차감 완료" : "재고 복구 완료";
        });

        return NextResponse.json({ 
            success: true, 
            message: responseMessage,
            items
        });

    } catch (error: any) {
        console.error("❌ 재고 업데이트 실패:", error);
        // 트랜잭션 밖에서 에러를 잡아서 클라이언트에 응답
        return NextResponse.json({ error: "재고 업데이트 실패", details: error.message }, { status: 500 });
    } finally {
        await session.endSession();
    }
}