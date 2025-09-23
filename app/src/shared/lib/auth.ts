import NaverProvider from "next-auth/providers/naver";
import KakaoProvider from "next-auth/providers/kakao";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions, getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { connectDB } from "@src/entities/models/db/mongoose";
import User from "@src/entities/models/User";
import bcrypt from "bcryptjs";
import { registUser } from "@src/shared/lib/server/user";
import { ONE_DAY, THIRTY_DAYS } from "@/src/utils/dataUtils";

export const authOptions: NextAuthOptions = {
    providers: [
        NaverProvider({
            clientId: process.env.NAVER_CLIENT_ID as string,
            clientSecret: process.env.NAVER_CLIENT_SECRET as string,
            authorization: {
                params: {
                    scope: "name email nickname mobile",
                },
            },
        }),
        KakaoProvider({
            clientId: process.env.KAKAO_CLIENT_ID as string,
            clientSecret: process.env.KAKAO_CLIENT_SECRET as string,
            authorization: {
                params: {
                    scope: "profile_nickname account_email phone_number",
                },
            },
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "email", type: "text" },
                password: { label: "password", type: "password" },
                rememberMe: { label: "rememberMe", type: "boolean" }, // 자동로그인
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
        async jwt({ token, user, account }) {
            // 1. 초기 로그인 시
            if (account && user) {
                // 일반 로그인: authorize에서 반환된 rememberMe 값 사용
                if (account.provider === "credentials") {
                    token.rememberMe = user.rememberMe === "true";
                } else {
                    // 소셜 로그인: 항상 '로그인 유지'로 간주
                    token.rememberMe = true;
                }
            }

            // 2. 토큰 만료 시간 동적 설정
            if (token.rememberMe) {
                // '로그인 유지'가 true이면, 토큰 만료 시간을 30일로 설정
                token.exp = Math.floor(Date.now() / 1000) + THIRTY_DAYS;
            } else {
                // 그렇지 않으면, 1일로 설정 (혹은 서비스 기본 정책에 맞게)
                token.exp = Math.floor(Date.now() / 1000) + ONE_DAY;
            }

            return token;
        },
        // session 콜백은 클라이언트로 전송될 세션 정보를 제어합니다.
        // 여기에 id 같은 정보를 추가하면 클라이언트에서 useSession으로 접근 가능합니다.
        async session({ session, token }) {
            if (session.user && token.sub) {
                (session.user as any).id = token.sub;
            }
            return session;
        },
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
    session: { strategy: "jwt", maxAge: THIRTY_DAYS },
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
