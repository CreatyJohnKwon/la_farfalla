import { connectDB } from "@src/entities/models/db/mongoose";
import Category from "@src/entities/models/Category";
import { NextRequest, NextResponse } from "next/server";

// slug 생성을 위한 헬퍼 함수
const createSlug = (name: string) => {
    return name
        .toLowerCase()
        .replace(/\s+/g, '-') // 공백을 하이픈(-)으로 변경
        .replace(/[^\w\-]+/g, ''); // 영문, 숫자, 밑줄, 하이픈 외의 문자 제거
};

// GET: 모든 카테고리 조회
export async function GET(req: NextRequest) {
    try {
        await connectDB();
        // displayOrder가 낮은 순, 같다면 최신 순으로 정렬
        const categories = await Category.find().sort({ displayOrder: 1, createdAt: -1 });
        return NextResponse.json(categories);
    } catch (error) {
        console.error("GET /api/categories error:", error);
        return NextResponse.json(
            { error: "카테고리 목록을 불러오는데 실패했습니다." },
            { status: 500 },
        );
    }
}

// POST: 새 카테고리 생성
export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { name, description, displayOrder } = await req.json();

        // 1. 입력값 검증 (name은 필수)
        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: "카테고리명은 필수입니다." },
                { status: 400 },
            );
        }

        const trimmedName = name.trim();
        const slug = createSlug(trimmedName);

        // 2. 중복 카테고리 검사 (name 또는 slug 기준)
        const existingCategory = await Category.findOne({
             $or: [
                { name: { $regex: new RegExp(`^${trimmedName}$`, "i") } }, // 이름 (대소문자 무시)
                { slug: slug } // 슬러그 (정확히 일치)
            ]
        });

        if (existingCategory) {
            return NextResponse.json(
                { error: "이미 동일한 이름 또는 slug를 가진 카테고리가 존재합니다." },
                { status: 409 }, // 409 Conflict: 리소스 충돌
            );
        }

        // 3. 새 카테고리 생성
        const newCategory = new Category({
            name: trimmedName,
            slug,
            description,
            displayOrder,
        });

        const savedCategory = await newCategory.save();
        return NextResponse.json(savedCategory, { status: 201 }); // 201 Created: 리소스 생성 성공
    } catch (error) {
        console.error("POST /api/categories error:", error);
        return NextResponse.json(
            { error: "카테고리 생성에 실패했습니다." },
            { status: 500 },
        );
    }
}

// PUT: 카테고리 수정
export async function PUT(req: NextRequest) {
    try {
        await connectDB();
        const { _id, name, description, displayOrder } = await req.json();

        // 1. ID 및 이름 검증
        if (!_id) {
            return NextResponse.json({ error: "카테고리 ID가 필요합니다." }, { status: 400 });
        }
        if (!name || !name.trim()) {
            return NextResponse.json({ error: "카테고리명은 필수입니다." }, { status: 400 });
        }

        const trimmedName = name.trim();
        const slug = createSlug(trimmedName);
        
        // 2. 수정하려는 카테고리가 존재하는지 확인
        const existingCategory = await Category.findById(_id);
        if (!existingCategory) {
            return NextResponse.json({ error: "해당 카테고리를 찾을 수 없습니다." }, { status: 404 });
        }

        // 3. 다른 카테고리와 이름/slug가 중복되는지 확인 (자기 자신은 제외)
        const duplicateCategory = await Category.findOne({
            _id: { $ne: _id }, // 자기 자신 제외
            $or: [
                { name: { $regex: new RegExp(`^${trimmedName}$`, "i") } },
                { slug: slug }
            ]
        });

        if (duplicateCategory) {
            return NextResponse.json(
                { error: "이미 동일한 이름 또는 slug를 가진 카테고리가 존재합니다." },
                { status: 409 },
            );
        }

        // 4. 카테고리 업데이트
        // findByIdAndUpdate는 업데이트된 문서를 반환 (옵션 {new: true})
        const updatedCategory = await Category.findByIdAndUpdate(
            _id,
            { name: trimmedName, slug, description, displayOrder },
            { new: true, runValidators: true },
        );

        return NextResponse.json(updatedCategory);
    } catch (error) {
        console.error("PUT /api/categories error:", error);
        return NextResponse.json({ error: "카테고리 수정에 실패했습니다." }, { status: 500 });
    }
}


// DELETE: 카테고리 삭제
export async function DELETE(req: NextRequest) {
    try {
        await connectDB();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "카테고리 ID가 필요합니다." }, { status: 400 });
        }

        const deletedCategory = await Category.findByIdAndDelete(id);

        if (!deletedCategory) {
            return NextResponse.json({ error: "해당 카테고리를 찾을 수 없습니다." }, { status: 404 });
        }

        return NextResponse.json({ message: "카테고리가 성공적으로 삭제되었습니다." });
    } catch (error) {
        console.error("DELETE /api/categories error:", error);
        return NextResponse.json({ error: "카테고리 삭제에 실패했습니다." }, { status: 500 });
    }
}