import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions, getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { connectDB } from "@src/entities/models/db/mongoose";
import User from "@src/entities/models/User";
import bcrypt from "bcryptjs";
import { registUser } from "@src/shared/lib/server/user";

export const authOptions: NextAuthOptions = {
    providers: [
        NaverProvider({
            clientId: process.env.NAVER_CLIENT_ID as string,
            clientSecret: process.env.NAVER_CLIENT_SECRET as string,
            authorization: {
                params: {
                    scope: "name email nickname profile_image mobile",
                },
            },
        }),
        KakaoProvider({
            clientId: process.env.KAKAO_CLIENT_ID as string,
            clientSecret: process.env.KAKAO_CLIENT_SECRET as string,
            authorization: {
                params: {
                    // scope: "profile_nickname profile_image account_email phone_number", // 승인되면 전화번호 추가
                    scope: "profile_nickname profile_image account_email",
                },
            },
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
                    throw new Error(
                        "회원정보가 없습니다\n회원가입을 진행해주세요",
                    );
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
        async signIn({ user, account, profile }) {
            if (account?.provider === "credentials") return true;

            await connectDB();

            const existingUser = await User.findOne({
                email: user.email as string,
            }).lean();

            if (!user.email) {
                console.error(
                    `303 | oauth_failure on ${account?.provider}: 이메일을 불러올 수 없습니다`,
                );
                return "/login?error=noemail";
            }

            if (!existingUser) {
                let phoneNumber = "";
                let image = user.image || "";

                if (
                    account?.provider === "naver" &&
                    profile &&
                    "response" in profile
                ) {
                    const response = (profile as any).response;
                    phoneNumber = response.mobile || "";
                    image = response.profile_image || image;
                }

                const result = await registUser({
                    name: (user.name as string) || "",
                    email: (user.email as string) || "",
                    password: "",
                    phoneNumber,
                    address: "",
                    detailAddress: "",
                    image,
                    provider: account!.provider as string,
                });

                if (result.success) {
                    console.log("로그인 성공 : " + result.message);
                    return true;
                }

                if (result.error) {
                    console.error(
                        `404 | oauth_failure on ${account?.provider}: ${result.error}`,
                    );
                    return false;
                }
            }

            return true;
        },
        async redirect({ url, baseUrl }) {
            if (!url) return baseUrl;
            return url.startsWith("/") ? `${baseUrl}${url}` : url;
        },
    },
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
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
