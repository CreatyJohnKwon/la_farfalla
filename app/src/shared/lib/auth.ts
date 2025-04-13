// lib/auth.ts
import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

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
        async signIn({ user, account, profile }) {
            return true;
        },
        async redirect({ url, baseUrl }) {
            return baseUrl;
        },
    },
    secret: process.env.NEXTAUTH_SECRET!,
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
