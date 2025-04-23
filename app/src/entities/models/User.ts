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
        isPrivateEmail: {
            type: Boolean,
            default: null, // 애플 프라이빗 릴레이 이메일 사용 여부
        },
        name: {
            type: String,
            required: true, // 이름은 필수 값
        },
        nickname: {
            type: String,
            default: null, // OAuth 닉네임
        },
        image: {
            type: String,
            default: null, // 프로필 이미지 URL
        },
        phoneNumber: {
            type: String,
            default: null, // 휴대전화 번호
        },
        password: {
            type: String,
            default: null, // 로컬 회원가입 비밀번호
        },
    },
    {
        timestamps: true,
        collection: "users",
    },
);

// 모델이 이미 정의되어 있으면 기존 모델을 반환, 없으면 새로 생성
const User = mongoose.models?.User || mongoose.model("User", userSchema);

export default User;
