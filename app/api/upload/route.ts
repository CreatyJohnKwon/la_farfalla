// app/api/upload/route.ts

import { NextRequest, NextResponse } from "next/server";
import uploadImageToR2 from "@/src/shared/lib/uploadToR2";

export async function POST(req: NextRequest) {
    try {
        const formData: FormData = await req.formData();
        const file: File = formData.get("image") as File;

        if (!file) {
            return NextResponse.json(
                { error: "파일이 첨부되지 않았습니다." },
                { status: 400 },
            );
        }

        const arrayBuffer: ArrayBuffer = await file.arrayBuffer();
        const buffer: Buffer = Buffer.from(arrayBuffer);
        const fileName: string = file.name || `image-${Date.now()}.jpg`;
        const url: string = await uploadImageToR2(buffer, fileName);

        return NextResponse.json({ url }, { status: 200 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "업로드 실패" }, { status: 500 });
    }
}
