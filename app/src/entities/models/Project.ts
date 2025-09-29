import mongoose, { Schema } from "mongoose";
import { IDescriptionItem } from "../type/products";

const descriptionItemSchema = new Schema<IDescriptionItem>(
    {
        itemType: {
            type: String,
            required: true,
            enum: ['image', 'break']
        },
        src: {
            type: String,
            // 'this' 타입을 명시적으로 지정한 것은 좋은 방법입니다.
            required: function(this: IDescriptionItem) {
                return this.itemType === 'image';
            }
        },
    },
    { _id: false }
);

const projectSchema = new mongoose.Schema(
    {
        // 프로젝트 제목
        title: {
            type: String,
            required: true,
        },
        // 프로젝트 대표 이미지
        image: {
            type: String,
            required: true,
        },
        // 프로젝트 내부 이미지 및 줄바꿈 배열
        description: {
            type: [descriptionItemSchema],
            required: true,
        },
    },
    {
        timestamps: true,
        collection: "projects",
    },
);

// 모델 이름을 'Project'로 통일하여 수정
export default mongoose.models?.Project || mongoose.model("Project", projectSchema);