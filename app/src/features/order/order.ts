"use server";

import Order from "@/src/entities/models/Order";
import User from "@/src/entities/models/User";
import { OrderData } from "@/src/entities/type/interfaces";
// import { sendOrderSMS } from "@/src/shared/lib/naverSmsService";
import mongoose from "mongoose";

const orderAccept = async (orderData: OrderData) => {
    try {
        // 1. 주문 생성
        const newOrder = await Order.create({
            ...orderData,
        });

        // 2. 사용자 정보(DB)에 마일리지 요소만 차감
        await User.findByIdAndUpdate(
            new mongoose.Types.ObjectId(orderData.userId),
            {
                $inc: { reward: +orderData.totalPrice },
            },
            { new: true },
        );

        // 3. SMS 발송 (010-2939-2833으로)
        // try {
        //     await sendOrderSMS({
        //         orderNumber: newOrder._id.toString(),
        //         customerName: orderData.userNm,
        //         totalAmount: orderData.totalPrice,
        //         itemCount: orderData.items.length,
        //     });

        //     console.log(
        //         `📱 주문 ${newOrder._id} - SMS 발송 완료 (010-2939-2833)`,
        //     );
        // } catch (smsError) {
        //     console.error("📱 SMS 발송 실패 (주문은 정상 처리됨):", smsError);
        // }

        return {
            success: true,
            message: "주문이 완료되었습니다.",
            orderId: newOrder._id.toString(),
        };
    } catch (error: any) {
        console.error("order failure: ", error?.message ?? error);
        return {
            success: false,
            message:
                error?.message ??
                "주문 처리 중 알 수 없는 오류가 발생했습니다.",
        };
    }
};

export { orderAccept };
