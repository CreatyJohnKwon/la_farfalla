import NextAuth from "next-auth";
import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";
// import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

export const dynamic = "force-static";

// NextAuth 설정
const authOptions: NextAuthOptions = {
    providers: [
        // ✅ 네이버 로그인
        NaverProvider({
            clientId: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID!,
            clientSecret: process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET!,
        }),
        KakaoProvider({
            clientId: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID!,
            clientSecret: process.env.NEXT_PUBLIC_KAKAO_CLIENT_SECRET!,
        }),


        // ✅ 이메일 & 비밀번호 로그인 (선택적 추가) 
        // 추후 기능 개발때 추가 수정
        // CredentialsProvider({
        //     name: "Credentials",
        //     credentials: {
        //         email: { label: "Email", type: "text", placeholder: "example@example.com" },
        //         password: { label: "Password", type: "password" },
        //     },
        //     async authorize(credentials) {
        //         // 여기서 사용자 검증 로직을 추가할 수 있음 (DB 조회 등)
        //         if (credentials?.email === "test@example.com" && credentials?.password === "password") {
        //             return { id: "1", name: "Test User", email: "test@example.com" };
        //         }
        //         return null;
        //     },
        // }),
    ],
};

// NextAuth 핸들러 적용
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };