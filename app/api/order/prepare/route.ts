import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Order } from "@/src/entities/models/Order";
import { v4 as uuidv4 } from 'uuid';
import { OrderItem } from "@/src/components/order/interface";
import Product from "@/src/entities/models/Product";
import { connectDB } from "@/src/entities/models/db/mongoose";
import { UserCoupon } from "@/src/entities/models/UserCoupon";
import User from "@/src/entities/models/User";

// 재고 감소 함수 (수정됨)
const reduceStock = async (items: OrderItem[], session: mongoose.ClientSession) => {
    // 1. 옵션 재고(Number 타입)만 먼저 원자적으로 차감합니다.
    const optionStockOperations = items.map(item => {
        const numericQuantity = parseInt(item.quantity as any, 10);
        if (isNaN(numericQuantity)) throw new Error(`상품 ID ${item.productId}의 수량이 유효하지 않습니다.`);

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
    });

    const result = await Product.bulkWrite(optionStockOperations, { session });
    if (result.modifiedCount < items.length) {
        throw new Error("일부 상품의 재고가 부족합니다.");
    }

    // 2. 최상위 재고(String 타입)는 별도로 조회하여 재계산 후 업데이트합니다.
    for (const item of items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) continue;
        const totalQuantity = product.options.reduce((sum: number, option: any) => sum + (option.stockQuantity || 0), 0);
        product.quantity = totalQuantity.toString();
        await product.save({ session });
    }
}

export async function POST(req: NextRequest) {
    await connectDB();
    const session = await mongoose.startSession();

    try {
        const { calculationData, baseOrderData } = await req.json();
        const { items, usedMileage, couponId } = calculationData;
        const { userId } = baseOrderData;

         // --- 2. 데이터베이스 트랜잭션 시작 ---
        const newOrder = await session.withTransaction(async () => {
            // --- 2-1. DB에서 원본 데이터 조회 및 검증 ---

            // 상품 가격 총합 계산 (DB 기준)
            let basePrice = 0;
            for (const item of items) {
                const product = await Product.findById(item.productId).select("price").session(session);
                if (!product) throw new Error(`상품 정보를 찾을 수 없습니다: ${item.productId}`);
                basePrice += Number(product.price) * Number(item.quantity);
            }

            // 사용자 정보 조회 및 마일리지 검증
            const user = await User.findById(userId).session(session);
            if (!user) throw new Error("사용자 정보를 찾을 수 없습니다.");
            if (usedMileage > 0 && user.mileage < usedMileage) {
                throw new Error("보유 마일리지가 부족합니다.");
            }

            // 쿠폰 정보 조회 및 유효성 검증
            let couponDiscount = 0;
            if (couponId) {
                const userCoupon = await UserCoupon.findOne({ _id: couponId, userId: userId, isUsed: false })
                    .populate('couponId') // Coupon 상세 정보 populate
                    .session(session);

                if (!userCoupon) throw new Error("유효하지 않거나 이미 사용된 쿠폰입니다.");
                
                const coupon = userCoupon.couponId as any; // Populate된 객체 타입 캐스팅
                if (coupon.minOrderAmount > basePrice) {
                    throw new Error(`쿠폰을 사용하려면 최소 ${coupon.minOrderAmount}원 이상 주문해야 합니다.`);
                }
                
                if (coupon.discountType === 'percentage') {
                    couponDiscount = basePrice * (coupon.discountValue / 100);
                    if (coupon.maxDiscountAmount && couponDiscount > coupon.maxDiscountAmount) {
                        couponDiscount = coupon.maxDiscountAmount;
                    }
                } else { // 'fixed'
                    couponDiscount = coupon.discountValue;
                }
            }
            
            // --- 2-2. 최종 결제 금액 계산 ---
            const finalAmount = Math.max(0, basePrice - couponDiscount - usedMileage);

            // --- 2-3. 데이터베이스 상태 변경 (쓰기 작업) ---
            // 재고 차감
            await reduceStock(items, session);

            // 마일리지 차감
            if (usedMileage > 0) {
                user.mileage -= usedMileage;
                await user.save({ session });
            }

            // 쿠폰 사용 처리
            if (couponId) {
                await UserCoupon.updateOne({ _id: couponId }, { isUsed: true }, { session });
            }

            // 주문서 생성 (DB에 저장)
            const temporaryOrderData = {
                ...baseOrderData,
                items,
                totalPrice: finalAmount, // ✅ 서버가 계산한 안전한 최종 금액 사용
                shippingStatus: "prepare",
                paymentId: uuidv4(),
                discountDetails: { coupon: couponDiscount, mileage: usedMileage }
            };
            const createdOrder = new Order(temporaryOrderData);
            await createdOrder.save({ session });
            return createdOrder;
        });

        if (!newOrder) {
            throw new Error("주문 생성 트랜잭션에 실패했습니다.");
        }
        
        // --- 3. 클라이언트에 결제 정보 응답 ---
        const orderName = items.length > 1
            ? `${items[0].productNm} 외 ${items.length - 1}건`
            : items[0].productNm;

        return NextResponse.json({
            success: true,
            paymentId: newOrder.paymentId,
            orderName,
            totalAmount: newOrder.totalPrice, // ✅ 서버가 계산하고 DB에 저장한 그 금액
            orderId: newOrder._id.toString(),
        });

    } catch (error: any) {
        console.error("주문 준비 API 오류:", error.message);
        return NextResponse.json(
            { success: false, message: error.message || '주문 준비 중 오류가 발생했습니다.' },
            { status: 500 }
        );
    } finally {
        await session.endSession();
    }
}