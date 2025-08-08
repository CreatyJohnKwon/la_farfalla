import { AnnounceModel } from "@/src/entities/models/Announce";
import { connectDB } from "@/src/entities/models/db/mongoose";
import { NextRequest, NextResponse } from "next/server";

// 공지 목록 조회
export async function GET() {
    try {
        await connectDB();
        const announces = await AnnounceModel.find().sort({ createdAt: -1 });
        return NextResponse.json(announces);
    } catch (error) {
        console.error("공지 조회 실패:", error);
        return NextResponse.json(
            { error: "공지 조회에 실패했습니다" },
            { status: 500 },
        );
    }
}

// 공지 생성
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        // 데이터 검증
        if (!body.description || typeof body.isPopup !== "boolean") {
            return NextResponse.json(
                { error: "필수 필드가 누락되었습니다" },
                { status: 400 },
            );
        }

        const announce = new AnnounceModel({
            ...body,
            visible: body.visible !== undefined ? body.visible : true, // 기본값 true
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        await announce.save();
        return NextResponse.json(announce, { status: 201 });
    } catch (error) {
        console.error("공지 생성 실패:", error);
        return NextResponse.json(
            { error: "공지 생성에 실패했습니다" },
            { status: 500 },
        );
    }
}

// 공지 수정 (새로 추가!)
export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        // ID 추출 - query parameter 또는 body에서
        const announceId =
            req.nextUrl.searchParams.get("aid") || body._id || body.id;

        if (!announceId) {
            return NextResponse.json(
                { error: "공지 ID가 필요합니다" },
                { status: 400 },
            );
        }

        // _id 필드는 업데이트에서 제외
        const updateData = { ...body };
        delete updateData._id;
        delete updateData.id;

        // updatedAt 필드 추가
        updateData.updatedAt = new Date();

        const updatedAnnounce = await AnnounceModel.findByIdAndUpdate(
            announceId,
            updateData,
            {
                new: true, // 업데이트된 문서 반환
                runValidators: true, // 스키마 검증 실행
            },
        );

        if (!updatedAnnounce) {
            return NextResponse.json(
                { error: "공지를 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        return NextResponse.json(updatedAnnounce);
    } catch (error) {
        console.error("공지 수정 실패:", error);
        return NextResponse.json(
            { error: "공지 수정에 실패했습니다" },
            { status: 500 },
        );
    }
}

// 공지 삭제
export async function DELETE(req: NextRequest) {
    try {
        await connectDB();
        const announceId = req.nextUrl.searchParams.get("aid");

        if (!announceId) {
            return NextResponse.json(
                { error: "공지 ID가 필요합니다" },
                { status: 400 },
            );
        }

        const result = await AnnounceModel.deleteOne({ _id: announceId });

        if (result.deletedCount === 0) {
            return NextResponse.json(
                { error: "공지를 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        return NextResponse.json({
            message: "공지가 성공적으로 삭제되었습니다",
        });
    } catch (error) {
        console.error("공지 삭제 실패:", error);
        return NextResponse.json(
            { error: "공지 삭제에 실패했습니다" },
            { status: 500 },
        );
    }
}
