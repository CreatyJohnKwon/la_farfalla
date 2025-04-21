import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String, // 이미지 파일명
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
            type: Number, // 색상 수
            default: 0,
        },
        key: {
            type: Number, // 상품 리스트용 키값
            unique: true,
            required: true,
        },
    },
    {
        timestamps: true,
        collection: "post",
    },
);

const Post = mongoose.models?.Post || mongoose.model("Post", postSchema);
export default Post;
