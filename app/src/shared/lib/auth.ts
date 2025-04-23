import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions, getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/src/entities/db/mongoose";
import User from "@/src/entities/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    providers: [
        NaverProvider({
            clientId: process.env.NAVER_CLIENT_ID as string,
            clientSecret: process.env.NAVER_CLIENT_SECRET as string,
        }),
        KakaoProvider({
            clientId: process.env.KAKAO_CLIENT_ID as string,
            clientSecret: process.env.KAKAO_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "email", type: "text" },
                password: { label: "password", type: "password" },
            },
            async authorize(credentials) {
                const { email, password } = credentials as any;
                await connectDB();
                const user = await User.findOne({ email: email });

                if (!user) {
                    throw new Error("회원정보가 없습니다\n회원가입을 진행해주세요");
                }

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    throw new Error("비밀번호가 틀렸습니다");
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                };
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "credentials") return true;

            await connectDB();

            const existingUser = await User.findOne({
                email: user.email,
            }).lean();

            if (!existingUser) {
                return "/login?error=not_registered";
            }

            return true;
        },
        async redirect({ baseUrl }) {
            return baseUrl;
        },
    },
    session: {
        strategy: "jwt",
    },
    secret: "fdYxkPSX01ULu0pPbHHhNb49UxqaFQwWsEibm6L5i9s" as string,
};

export async function redirectIfNeeded(type: "login" | "profile" | "register") {
    const session = await getServerSession(authOptions);

    if (type === "login" && session) {
        redirect("/profile");
    }

    if (type === "register" && session) {
        redirect("/profile");
    }

    if (type === "profile" && !session) {
        redirect("/login");
    }
}
