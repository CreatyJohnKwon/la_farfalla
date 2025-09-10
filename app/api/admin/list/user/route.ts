import { connectDB } from "@src/entities/models/db/mongoose";
import User from "@src/entities/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    await connectDB();
    const user = await User.find().sort({ createdAt: -1 });

    return NextResponse.json(user);
}