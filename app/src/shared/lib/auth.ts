import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";
import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import User from "@/src/entities/models/User";

export const authOptions: NextAuthOptions = {
    providers: [
        NaverProvider({
            clientId: process.env.NAVER_CLIENT_ID!,
            clientSecret: process.env.NAVER_CLIENT_SECRET!,
        }),
        KakaoProvider({
            clientId: process.env.KAKAO_CLIENT_ID!,
            clientSecret: process.env.KAKAO_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            // mongoose를 사용하여 데이터베이스에서 유저 정보 조회
            const existingUser = await User.findOne({ email: user.email });

            if (!existingUser) {
                // 아직 회원가입 안 된 사용자
                return "/login";
            }

            if (!existingUser.nickname || !existingUser.agreeToTerms) {
                // 온보딩 미완료
                return "/login";
            }

            return true; // 정상 로그인
        },
        async redirect({ baseUrl }) {
            return baseUrl;
        },
    },
    secret: "fdYxkPSX01ULu0pPbHHhNb49UxqaFQwWsEibm6L5i9s",
};

export async function redirectIfNeeded(type: "login" | "profile") {
    const session = await getServerSession(authOptions);

    if (type === "login" && session) {
        redirect("/profile");
    }

    if (type === "profile" && !session) {
        redirect("/login");
    }
}
