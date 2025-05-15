import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: new mongoose.Schema({
                image: { type: [String], default: [] },
                text: { type: String, required: true },
            }),
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        discount: {
            type: Number, // 퍼센트 단위 할인
            default: 0,
        },
        category: {
            type: String,
            required: true,
        },
        image: {
            type: String, // 메인 이미지 파일명
            required: true,
        },
        colors: {
            type: [String], // 색상 수
            required: true,
            default: 0,
        },
        key: {
            type: Number, // 상품 리스트용 키값
            unique: true,
            required: true,
        },
        size: {
            type: [String],
            required: true,
            default: [],
        },
    },
    {
        timestamps: true,
        collection: "post",
    },
);

export default mongoose.models?.Post || mongoose.model("Post", postSchema);
