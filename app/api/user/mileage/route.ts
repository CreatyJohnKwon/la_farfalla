import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/src/entities/models/db/mongoose";
import { Mileage } from "@/src/entities/models/Mileage";

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
        return NextResponse.json(
            { error: "userId is required" },
            { status: 400 },
        );
    }

    await connectDB();
    const mileages = await Mileage.find({ userId }).lean();

    return NextResponse.json(mileages);
}
