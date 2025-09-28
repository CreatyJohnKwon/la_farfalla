import { IDescriptionItem } from "@src/entities/type/products";
import mongoose, { Schema } from "mongoose";

const descriptionItemSchema = new Schema<IDescriptionItem>(
    {
        itemType: {
            type: String,
            required: true,
            enum: ['image', 'break']
        },
        src: {
            type: String,
            // ✨ 3. 'this'의 타입을 명시적으로 지정하여 오류 해결
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
            default: ""
        },
        // 프로젝트 대표 이미지
        image: {
            type: String,
            require: true,
            default: ""
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

export default mongoose.models?.Product || mongoose.model("Project", projectSchema);