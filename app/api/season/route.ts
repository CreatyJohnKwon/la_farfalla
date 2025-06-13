import { connectDB } from "@/src/entities/models/db/mongoose";
import Season from "@/src/entities/models/Season";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await connectDB();
    const season = await Season.find().sort({ createdAt: -1 });

    return NextResponse.json(season);
}
