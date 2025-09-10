import mongoose from "mongoose";

// 새로운 카테고리 스키마
const categorySchema = new mongoose.Schema(
    {
        name: { 
            type: String, 
            required: true,
            trim: true,
        },
        // URL 주소 등에 사용될 고유 식별자 (예: "tops", "electronics", "2025-ss-new")
        slug: { 
            type: String, 
            required: true, 
            unique: true,
            trim: true,
        },
        // 카테고리에 대한 설명 (선택 사항)
        description: { 
            type: String,
            trim: true,
        },
        // 카테고리 노출 순서 (숫자가 낮을수록 먼저 보이도록)
        displayOrder: {
            type: Number,
            default: 0,
        },
    },
    { 
        timestamps: true, 
        collection: "categories", // 컬렉션 이름은 복수형을 권장합니다.
    },
);

// slug 필드에 인덱스를 생성하여 검색 성능 향상
categorySchema.index({ slug: 1 });

export default mongoose.models?.Category ||
    mongoose.model("Category", categorySchema);