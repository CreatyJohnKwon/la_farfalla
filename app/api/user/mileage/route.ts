import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@src/entities/models/db/mongoose";
import { Mileage } from "@src/entities/models/Mileage";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get("userId");

    // 1. page와 limit 쿼리 파라미터 받기
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    if (!userId) {
        return NextResponse.json(
            { error: "userId is required" },
            { status: 400 },
        );
    }

    // 2. 건너뛸(skip) 문서 개수 계산
    const skip = (page - 1) * limit;

    try {
        await connectDB();

        // 3. Mongoose의 skip과 limit을 사용하여 페이지네이션 적용
        const mileages = await Mileage.find({ userId })
            .sort({ createdAt: -1 }) // 최신순으로 정렬
            .skip(skip)              // 계산된 만큼 문서를 건너뛰고
            .limit(limit)            // limit 개수만큼 문서를 가져옴
            .lean();                 // 성능 향상을 위해 lean() 사용

        return NextResponse.json(mileages);

    } catch (error) {
        console.error("마일리지 조회 API 오류:", error);
        return NextResponse.json(
            { error: "서버 오류가 발생했습니다." },
            { status: 500 },
        );
    }
}
