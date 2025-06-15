import { connectDB } from "@/src/entities/models/db/mongoose";
import Season from "@/src/entities/models/Season";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const seasons = await Season.find().sort({ createdAt: -1 });
        return NextResponse.json(seasons);
    } catch (error) {
        console.error("GET /api/seasons error:", error);
        return NextResponse.json(
            { error: "시즌 목록을 불러오는데 실패했습니다." },
            { status: 500 },
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { title, year } = await req.json();

        // 입력값 검증
        if (!title || !year) {
            return NextResponse.json(
                { error: "시즌명과 연도를 모두 입력해주세요." },
                { status: 400 },
            );
        }

        const trimmedTitle = title.trim();
        const trimmedYear = year.trim();

        if (!trimmedTitle || !trimmedYear) {
            return NextResponse.json(
                { error: "시즌명과 연도를 모두 입력해주세요." },
                { status: 400 },
            );
        }

        // 중복 시즌명 검사
        const existingSeason = await Season.findOne({
            title: { $regex: new RegExp(`^${trimmedTitle}$`, "i") },
        });

        if (existingSeason) {
            return NextResponse.json(
                { error: "이미 동일한 시즌명이 존재합니다." },
                { status: 409 },
            );
        }

        // 새 시즌 생성
        const newSeason = new Season({
            title: trimmedTitle,
            year: trimmedYear,
        });

        const savedSeason = await newSeason.save();

        return NextResponse.json(savedSeason, { status: 201 });
    } catch (error) {
        console.error("POST /api/seasons error:", error);
        return NextResponse.json(
            { error: "시즌 생성에 실패했습니다." },
            { status: 500 },
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const { _id, title, year } = await req.json();

        // 입력값 검증
        if (!_id) {
            return NextResponse.json(
                { error: "시즌 ID가 필요합니다." },
                { status: 400 },
            );
        }

        if (!title || !year) {
            return NextResponse.json(
                { error: "시즌명과 연도를 모두 입력해주세요." },
                { status: 400 },
            );
        }

        const trimmedTitle = title.trim();
        const trimmedYear = year.trim();

        if (!trimmedTitle || !trimmedYear) {
            return NextResponse.json(
                { error: "시즌명과 연도를 모두 입력해주세요." },
                { status: 400 },
            );
        }

        // 수정하려는 시즌이 존재하는지 확인
        const existingSeason = await Season.findById(_id);
        if (!existingSeason) {
            return NextResponse.json(
                { error: "해당 시즌을 찾을 수 없습니다." },
                { status: 404 },
            );
        }

        // 다른 시즌과 중복되는지 확인 (자기 자신은 제외)
        const duplicateSeason = await Season.findOne({
            _id: { $ne: _id },
            title: { $regex: new RegExp(`^${trimmedTitle}$`, "i") },
        });

        if (duplicateSeason) {
            return NextResponse.json(
                { error: "이미 동일한 시즌명이 존재합니다." },
                { status: 409 },
            );
        }

        // 시즌 업데이트
        const updatedSeason = await Season.findByIdAndUpdate(
            _id,
            {
                title: trimmedTitle,
                year: trimmedYear,
                updatedAt: new Date(),
            },
            { new: true, runValidators: true },
        );

        return NextResponse.json(updatedSeason);
    } catch (error) {
        console.error("PUT /api/seasons error:", error);
        return NextResponse.json(
            { error: "시즌 수정에 실패했습니다." },
            { status: 500 },
        );
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "시즌 ID가 필요합니다." },
                { status: 400 },
            );
        }

        // 시즌이 존재하는지 확인
        const existingSeason = await Season.findById(id);
        if (!existingSeason) {
            return NextResponse.json(
                { error: "해당 시즌을 찾을 수 없습니다." },
                { status: 404 },
            );
        }

        // 시즌 삭제
        await Season.findByIdAndDelete(id);

        return NextResponse.json(
            { message: "시즌이 성공적으로 삭제되었습니다." },
            { status: 200 },
        );
    } catch (error) {
        console.error("DELETE /api/seasons error:", error);
        return NextResponse.json(
            { error: "시즌 삭제에 실패했습니다." },
            { status: 500 },
        );
    }
}
