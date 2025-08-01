import mongoose from "mongoose";

// 사용자 스키마 정의
const userSchema = new mongoose.Schema(
    {
        provider: {
            type: String,
            enum: ["local", "kakao", "naver", "apple"], // 로그인 방식 구분
            default: "local",
        },
        email: {
            type: String,
            required: true, // 이메일은 필수 값
            unique: true, // 이메일은 고유해야 함
        },
        emailVerified: {
            type: Boolean,
            default: false, // 이메일 인증 여부
        },
        name: {
            type: String,
            required: true, // 이름은 필수 값
        },
        address: {
            type: String,
            required: false,
            default: null, // 주소는 선택 사항
        },
        detailAddress: {
            type: String,
            required: false,
            default: null, // 상세 주소는 선택 사항
        },
        postcode: {
            type: String,
            required: false,
            default: null, // 우편 번호는 선택 사항
        },
        phoneNumber: {
            type: String,
            required: false,
            default: null, // 전화번호는 선택 사항
        },
        password: {
            type: String,
            required: true,
            default: null,
        },
        reward: {
            type: Number,
            required: false,
            default: 0,
        },
        mileage: {
            type: Number,
            required: false,
            default: 0,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: "users",
    },
);

// TTL 유저 삭제 로직 (30일 유예)
userSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 0 });

// 모델이 이미 정의되어 있으면 기존 모델을 반환, 없으면 새로 생성
export default mongoose.models?.User || mongoose.model("User", userSchema);
