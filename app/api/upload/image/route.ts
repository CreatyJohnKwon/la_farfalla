import { NextRequest, NextResponse } from "next/server";
import { uploadImageToR2 } from "@src/shared/lib/uploadToR2";

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '50mb', 
        },
    },
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        // 파일 가져오기 (여러 이름 중 하나)
        let rawFiles = formData.getAll("images");
        if (!rawFiles || rawFiles.length === 0) {
            rawFiles = formData.getAll("files");
        }
        if (!rawFiles || rawFiles.length === 0) {
            rawFiles = formData.getAll("file");
        }

        // 유효성 검사: File 타입 체크를 다르게 처리
        const files = rawFiles.filter((item): item is File => {
            // FormData에서 가져온 항목이 파일인지 확인
            return (
                item instanceof Object &&
                typeof (item as any).name === "string" &&
                typeof (item as any).size === "number" &&
                typeof (item as any).type === "string" &&
                typeof (item as any).arrayBuffer === "function"
            );
        });

        if (files.length === 0) {
            return NextResponse.json(
                { error: "파일이 첨부되지 않았습니다." },
                { status: 400 },
            );
        }

        // R2 업로드
        const urls = await Promise.all(
            files.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const fileName = file.name || `image-${Date.now()}.jpg`;
                return uploadImageToR2(buffer, fileName);
            }),
        );

        return NextResponse.json({ urls }, { status: 200 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "업로드 실패" }, { status: 500 });
    }
}
