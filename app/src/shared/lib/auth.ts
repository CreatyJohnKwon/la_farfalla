import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { connectDB } from "@/src/entities/db/database";

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
    adapter: MongoDBAdapter(connectDB),
    callbacks: {
        async signIn({ user }) {
            const db = (await connectDB).db();
            const existingUser = await db
                .collection("users")
                .findOne({ email: user.email });

            if (!existingUser) {
                // 오류 처리: 사용자가 존재하지 않음
                return "/login";
            }

            if (!existingUser.nickname || !existingUser.agreeToTerms) {
                return "/login"; // 아직 등록된 사용자 아님 → 온보딩으로
            }

            return true; // 이미 가입된 사용자 → 정상 로그인
        },
        async redirect({ baseUrl }) {
            return baseUrl; // 로그인 성공 시 홈으로 보내기 (필요하면 커스터마이즈 가능)
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
