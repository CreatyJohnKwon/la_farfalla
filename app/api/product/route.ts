import { connectDB } from "@/src/entities/models/db/mongoose";
import Post from "@/src/entities/models/Post";
import { NextRequest, NextResponse } from "next/server";

const GET = async (req: NextRequest) => {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        
        if (!id) {
            return NextResponse.json({ error: "Missing id" }, { status: 400 });
        }
        
        const productItem = await Post.findById(id).lean();

        if (!productItem) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(productItem);
    } catch (err) {
        console.error("Error:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

export { GET }