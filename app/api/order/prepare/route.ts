import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { Order } from "@/src/entities/models/Order";
import { OrderItem } from "@/src/components/order/interface";
import Product from "@/src/entities/models/Product";
import { connectDB } from "@/src/entities/models/db/mongoose";
import { UserCoupon } from "@/src/entities/models/UserCoupon";
import User from "@/src/entities/models/User";

// 재고 감소 함수 (수정됨)
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

export async function POST(req: NextRequest) {
    await connectDB();
    const session = await mongoose.startSession();

    try {
        const { calculationData, baseOrderData, idempotencyKey } = await req.json();

        if (!idempotencyKey) {
            throw new Error("멱등성 키가 필요합니다.");
        }

        const { items, usedMileage, couponId } = calculationData;
        const { userId } = baseOrderData;

         // --- 2. 데이터베이스 트랜잭션 시작 ---
        const newOrder = await session.withTransaction(async () => {
            const existingOrder = await Order.findOne({ paymentId: idempotencyKey }).session(session);

            if (existingOrder) {
                console.log(`멱등성 키 ${idempotencyKey}에 대한 기존 주문을 재사용합니다.`);
                return existingOrder;
            }

            // 상품 가격 총합 계산 (DB 기준)
            let serverCalculatedTotalPrice = 0;
            for (const item of items) {
                const product = await Product.findById(item.productId)
                    .select("price discount options additionalOptions")
                    .session(session);

                if (!product) throw new Error(`상품 정보를 찾을 수 없습니다: ${item.productId}`);

                let itemPrice = 0;
                // [분기 1] 일반 상품 (size와 color가 존재)
                if (item.size && item.color) {
                    const originalPrice = Number(product.price);
                    const discount = Number(product.discount);
                    // 서버에서 직접 할인가 계산
                    itemPrice = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : originalPrice;

                // [분기 2] 추가 옵션 상품 (size와 color가 없음)
                } else {
                    // product.additionalOptions 배열에서 해당 추가 옵션을 찾아 가격을 가져옴
                    const addOption = product.additionalOptions?.find((opt: any) => opt.name === item.additional);
                    if (!addOption) throw new Error(`추가 옵션 정보를 찾을 수 없습니다: ${item.additional}`);
                    itemPrice = addOption.additionalPrice || 0;
                }

                serverCalculatedTotalPrice += itemPrice * Number(item.quantity);
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
                if (coupon.minOrderAmount > serverCalculatedTotalPrice) {
                    throw new Error(`쿠폰을 사용하려면 최소 ${coupon.minOrderAmount}원 이상 주문해야 합니다.`);
                }
                
                if (coupon.discountType === 'percentage') {
                    couponDiscount = serverCalculatedTotalPrice * (coupon.discountValue / 100);
                    if (coupon.maxDiscountAmount && couponDiscount > coupon.maxDiscountAmount) {
                        couponDiscount = coupon.maxDiscountAmount;
                    }
                } else { // 'fixed'
                    couponDiscount = coupon.discountValue;
                }
            }
            
            // --- 2-2. 최종 결제 금액 계산 ---
            const finalAmount = Math.max(0, serverCalculatedTotalPrice - couponDiscount - usedMileage);

            // --- 2-3. 데이터베이스 상태 변경 (쓰기 작업) ---
            // 재고 차감
            await reduceStock(items, session);

            // 마일리지 차감 : 마일리지는 구매 확정후 차감함
            // if (usedMileage > 0) {
            //     user.mileage -= usedMileage;
            //     await user.save({ session });
            // }

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
                paymentId: idempotencyKey,
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
            totalAmount: newOrder.totalPrice,
            orderId: newOrder._id.toString(),
            message: "주문이 준비되었습니다"
        }, { status: 200 });

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