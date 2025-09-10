import { AnnounceModel } from "@src/entities/models/Announce";
import { connectDB } from "@src/entities/models/db/mongoose";
import { NextRequest, NextResponse } from "next/server";

// MongoDB Document를 평문 객체로 변환하는 헬퍼 함수
const transformAnnounce = (doc: any) => {
    return {
        _id: doc._id.toString(), // ObjectId를 string으로 변환
        isPopup: doc.isPopup,
        description: doc.description,
        startAt: doc.startAt,
        deletedAt: doc.deletedAt,
        visible: doc.visible,
        backgroundColor: doc.backgroundColor || "",
        textColor: doc.textColor || "",
        createdAt: doc.createdAt || "",
        updatedAt: doc.updatedAt,
    };
};

// 헥스 코드 유효성 검사 함수
const isValidHexColor = (color: string): boolean => {
    return /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// 공지 목록 조회
export async function GET() {
    try {
        await connectDB();
        const announces = await AnnounceModel.find().sort({ createdAt: -1 });

        // MongoDB 문서를 평문 객체로 변환
        const transformedAnnounces = announces.map(transformAnnounce);

        return NextResponse.json(transformedAnnounces);
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

        // 기본 데이터 검증
        if (!body.description || typeof body.isPopup !== "boolean") {
            return NextResponse.json(
                { error: "필수 필드가 누락되었습니다" },
                { status: 400 },
            );
        }

        // 배너 모드일 때 색상 필드 검증
        if (body.isPopup === false) {
            if (!body.textColor || !body.backgroundColor) {
                return NextResponse.json(
                    {
                        error: "배너 모드에서는 텍스트 색상과 배경색이 필요합니다",
                    },
                    { status: 400 },
                );
            }

            if (
                !isValidHexColor(body.textColor) ||
                !isValidHexColor(body.backgroundColor)
            ) {
                return NextResponse.json(
                    {
                        error: "올바른 헥스 색상 코드를 입력해주세요 (예: ffffff, 000000)",
                    },
                    { status: 400 },
                );
            }
        }

        // 날짜 검증
        if (body.startAt && body.deletedAt) {
            const startDate = new Date(body.startAt);
            const endDate = new Date(body.deletedAt);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return NextResponse.json(
                    { error: "올바르지 않은 날짜 형식입니다" },
                    { status: 400 },
                );
            }

            if (endDate <= startDate) {
                return NextResponse.json(
                    { error: "종료 날짜는 시작 날짜보다 이후여야 합니다" },
                    { status: 400 },
                );
            }
        }

        const announceData = {
            ...body,
            visible: body.visible !== undefined ? body.visible : true, // 기본값 true
            // 팝업 모드일 때는 색상 필드를 빈 문자열로 설정
            backgroundColor: body.isPopup === false ? body.backgroundColor : "",
            textColor: body.isPopup === false ? body.textColor : "",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const announce = new AnnounceModel(announceData);
        const savedAnnounce = await announce.save();

        // MongoDB 문서를 평문 객체로 변환
        const transformedAnnounce = transformAnnounce(savedAnnounce);

        return NextResponse.json(transformedAnnounce, { status: 201 });
    } catch (error) {
        console.error("공지 생성 실패:", error);
        return NextResponse.json(
            { error: "공지 생성에 실패했습니다" },
            { status: 500 },
        );
    }
}

// 공지 수정
export async function PATCH(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();

        const announceId =
            req.nextUrl.searchParams.get("aid") || body._id || body.id;

        if (!announceId) {
            return NextResponse.json(
                { error: "공지 ID가 필요합니다" },
                { status: 400 },
            );
        }

        // 기존 데이터 조회
        const existingAnnounce = await AnnounceModel.findById(announceId);
        if (!existingAnnounce) {
            return NextResponse.json(
                { error: "공지를 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        const updateData = { ...body };
        delete updateData._id;
        delete updateData.id;

        // isPopup 값 검증
        if (
            updateData.isPopup !== undefined &&
            typeof updateData.isPopup !== "boolean"
        ) {
            return NextResponse.json(
                { error: "isPopup 값이 올바르지 않습니다" },
                { status: 400 },
            );
        }

        // description 값 검증
        if (
            updateData.description !== undefined &&
            typeof updateData.description !== "string"
        ) {
            return NextResponse.json(
                { error: "description 값이 올바르지 않습니다" },
                { status: 400 },
            );
        }

        // 배너 모드일 때 색상 필드 처리
        const finalIsPopup =
            updateData.isPopup !== undefined
                ? updateData.isPopup
                : existingAnnounce.isPopup;

        if (finalIsPopup === false) {
            // 기존 색상 값과 새로운 값 병합
            const currentTextColor = existingAnnounce.textColor || "";
            const currentBackgroundColor =
                existingAnnounce.backgroundColor || "";

            const finalTextColor =
                updateData.textColor !== undefined
                    ? updateData.textColor
                    : currentTextColor;
            const finalBackgroundColor =
                updateData.backgroundColor !== undefined
                    ? updateData.backgroundColor
                    : currentBackgroundColor;

            // 최종 색상 값이 모두 있는지 확인
            if (!finalTextColor || !finalBackgroundColor) {
                return NextResponse.json(
                    {
                        error: "배너 모드에서는 텍스트 색상과 배경색이 모두 필요합니다",
                    },
                    { status: 400 },
                );
            }

            // 색상 유효성 검사
            if (
                !isValidHexColor(finalTextColor) ||
                !isValidHexColor(finalBackgroundColor)
            ) {
                return NextResponse.json(
                    {
                        error: "올바른 헥스 색상 코드를 입력해주세요 (예: ffffff, 000000)",
                    },
                    { status: 400 },
                );
            }

            // 업데이트 데이터에 최종 색상 값 설정
            updateData.textColor = finalTextColor;
            updateData.backgroundColor = finalBackgroundColor;
        }

        // 개별 색상 필드 검증 (값이 제공된 경우만)
        if (updateData.textColor !== undefined && updateData.textColor !== "") {
            if (!isValidHexColor(updateData.textColor)) {
                return NextResponse.json(
                    {
                        error: "올바른 텍스트 색상 코드를 입력해주세요 (예: ffffff, 000000)",
                    },
                    { status: 400 },
                );
            }
        }

        if (
            updateData.backgroundColor !== undefined &&
            updateData.backgroundColor !== ""
        ) {
            if (!isValidHexColor(updateData.backgroundColor)) {
                return NextResponse.json(
                    {
                        error: "올바른 배경 색상 코드를 입력해주세요 (예: ffffff, 000000)",
                    },
                    { status: 400 },
                );
            }
        }

        // 팝업 모드로 변경될 때 색상 필드 초기화
        if (updateData.isPopup === true) {
            updateData.backgroundColor = "";
            updateData.textColor = "";
        }

        // 날짜 검증
        if (updateData.startAt && updateData.deletedAt) {
            const startDate = new Date(updateData.startAt);
            const endDate = new Date(updateData.deletedAt);

            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return NextResponse.json(
                    { error: "올바르지 않은 날짜 형식입니다" },
                    { status: 400 },
                );
            }

            if (endDate <= startDate) {
                return NextResponse.json(
                    { error: "종료 날짜는 시작 날짜보다 이후여야 합니다" },
                    { status: 400 },
                );
            }

            updateData.startAt = startDate;
            updateData.deletedAt = endDate;
        }

        // updatedAt 추가
        updateData.updatedAt = new Date();

        const updatedAnnounce = await AnnounceModel.findByIdAndUpdate(
            announceId,
            updateData,
            { new: true, runValidators: false },
        );

        if (!updatedAnnounce) {
            return NextResponse.json(
                { error: "공지를 찾을 수 없습니다" },
                { status: 404 },
            );
        }

        return NextResponse.json(transformAnnounce(updatedAnnounce));
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
