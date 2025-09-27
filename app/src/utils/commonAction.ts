import mongoose from "mongoose";
import { OrderItem } from "../components/order/interface";
import Product from "../entities/models/Product";

/**
 * 한글 단어 뒤에 오는 조사를 결정하는 함수 (이/가)
 * @param word 조사 앞의 단어
 * @returns '이' 또는 '가'
 */
const getPostposition = (word: string): string => {
    const lastChar = word.charCodeAt(word.length - 1);
    // 한글 음절 범위이고 받침(종성)이 있는지 확인
    if (lastChar >= 0xac00 && lastChar <= 0xd7a3) {
        return (lastChar - 0xac00) % 28 > 0 ? "이" : "가";
    }
    return "가";
};

// 재고 감소 함수
const reduceStock = async (items: OrderItem[], session: mongoose.ClientSession) => {
    // 1. 옵션 재고(Number 타입)만 먼저 원자적으로 차감합니다.
    const stockOperations = items.map(item => {
        const numericQuantity = parseInt(item.quantity as any, 10);
        if (isNaN(numericQuantity)) throw new Error(`상품 ID ${item.productId}의 수량이 유효하지 않습니다.`);

        if (item.color && item.size) {
            return {
                updateOne: {
                    filter: {
                        _id: item.productId,
                        "options.colorName": item.color,
                        "options.stockQuantity": { $gte: numericQuantity }
                    },
                    update: {
                        $inc: { "options.$.stockQuantity": -numericQuantity }
                    }
                }
            };
        } else {
            return {
                updateOne: {
                    filter: {
                        _id: item.productId,
                        "additionalOptions.name": item.additional,
                        "additionalOptions.stockQuantity": { $gte: numericQuantity }
                    },
                    update: {
                        $inc: { "additionalOptions.$.stockQuantity": -numericQuantity }
                    }
                }
            };
        }
    });

    // 2. 생성된 모든 재고 차감 로직을 bulkWrite로 한번에 실행합니다.
    const result = await Product.bulkWrite(stockOperations, { session });

    if (result.modifiedCount < items.length) {
        throw new Error("일부 상품의 재고가 부족합니다.");
    }

    const productItems = items.filter(item => item.color && item.size);
    const uniqueProductIds = [...new Set(productItems.map(item => item.productId))];

    for (const productId of uniqueProductIds) {
        const product = await Product.findById(productId).session(session);
        if (!product) continue;
        
        const totalQuantity = product.options.reduce((sum: number, option: any) => sum + (option.stockQuantity || 0), 0);
        product.quantity = totalQuantity.toString();
        await product.save({ session });
    }
}

export {
    getPostposition,
    reduceStock
}