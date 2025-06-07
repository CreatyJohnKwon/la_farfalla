"use server";

import { MileageItem } from "@/src/entities/type/interfaces";
import { Mileage } from "@/src/entities/models/Mileage";
import User from "@/src/entities/models/User";
import mongoose from "mongoose";

// 상품 구매시에 들어올 마일리지 정보
const earnMileage = async (item: MileageItem) => {
    const { userId, amount } = item;

    // 마일리지 적립 정보 투입
    await Mileage.create(item);

    // 사용자 정보(DB)에 마일리지 요소만 추가
    await User.findByIdAndUpdate(new mongoose.Types.ObjectId(userId), {
        $inc: { reward: amount },
    });
}

// 상품 구매 시에 사용된 마일리지 차감
const spendMileage = async (item: MileageItem) => {
  const { userId, amount } = item;

    // 마일리지 사용 정보 투입
    await Mileage.create(item);
        // ...rest,
        // userId,
        // amount,
        // type: "spend",
        // createdAt: new Date().toISOString(),
    // );

    // 사용자 정보(DB)에 마일리지 요소만 차감
    await User.findByIdAndUpdate(new mongoose.Types.ObjectId(userId), {
        $inc: { reward: -amount },
    });
}

export { earnMileage, spendMileage };
