import { connectDB } from "@/src/entities/models/db/mongoose";
import { Order } from "@/src/entities/models/Order";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

const findOrderById = async (orderId: string) => {
  try {
    // 1. 데이터베이스 연결
    await connectDB();

    // 2. ID 유효성 검사 (잘못된 형식의 ID로 DB에 불필요한 요청 방지)
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      console.warn("제공된 orderId가 유효하지 않습니다:", orderId);
      return null;
    }

    // 3. ID로 주문 조회 (단일 책임)
    const order = await Order.findOne({ _id: orderId }).lean();

    // 4. 결과 반환
    if (!order) {
      console.log(`ID에 해당하는 주문을 찾을 수 없습니다: ${orderId}`);
      return null;
    }

    return order;
  } catch (error) {
    console.error("주문 조회 중 오류가 발생했습니다:", error);
    // 실제 프로덕션 환경에서는 오류 로깅 서비스를 사용하는 것이 좋습니다.
    throw new Error("주문 정보를 가져오는 데 실패했습니다.");
  }
};

export async function GET(
  req: NextRequest, 
  { params }: { params: Promise<{ orderId: string }>}
) {
  try {
    const { orderId } = await params;
    const order = await findOrderById(orderId);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "주문을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order });
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

