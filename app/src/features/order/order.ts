"use server";

import Order from "@/src/entities/models/Order";
import User from "@/src/entities/models/User";
import { OrderData } from "@/src/entities/type/interfaces";
import mongoose from "mongoose";

const orderAccept = async (orderData: OrderData) => {
    try {
        const newOrder = await Order.create({
            ...orderData,
        });

        // 사용자 정보(DB)에 마일리지 요소만 차감
        await User.findByIdAndUpdate(
            new mongoose.Types.ObjectId(orderData.userId),
            {
                $inc: { reward: +orderData.totalPrice },
            },
        );

        return {
            success: true,
            message: "주문이 완료되었습니다.",
            orderId: newOrder._id.toString(), // Optional
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
