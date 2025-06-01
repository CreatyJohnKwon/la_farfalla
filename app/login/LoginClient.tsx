"use client";

import CustomButton from "@/src/widgets/button/CustomButton";
import useUsers from "@/src/shared/hooks/useUsers";
import { useEffect } from "react";
import loginAction from "./actions";
import Link from "next/link";
import { SiNaver } from "react-icons/si";
import { RiKakaoTalkFill } from "react-icons/ri";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const LoginClient = () => {
    const {
        email,
        password,
        isDisabled,
        setEmail,
        setPassword,
        setIsDisabled,
    } = useUsers();

    const { loginHandler } = useUsers();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    useEffect(() => {
        setIsDisabled(email.trim() === "" || password.trim() === "");
    }, [email, password]);

    useEffect(() => {
        if (searchParams.get("error") === "notfound") {
            queueMicrotask(() => {
                alert("간편로그인에 실패하였습니다");
                router.replace(pathname);
            });
        } else if (searchParams.get("error") === "noemail") {
            queueMicrotask(() => {
                alert("이메일을 불러올 수 없습니다");
                router.replace(pathname);
            });
        }
    }, [searchParams]);

    return (
        <div className="h-screen w-screen">
            <div className="flex h-full w-auto flex-col items-center justify-center text-center">
                <form
                    className="font-amstel flex w-5/6 flex-col items-center justify-center gap-6 sm:w-2/6"
                    action={loginAction}
                >
                    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-6">
                        <div className="flex w-full flex-col gap-4 text-xs sm:col-span-4 md:text-base">
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Insert Email"
                                className="h-14 w-full border border-gray-200 bg-gray-50 px-4 text-gray-700 transition-all duration-300 ease-in-out placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:h-16"
                            />
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Insert Password"
                                className="h-14 w-full border border-gray-200 bg-gray-50 px-4 text-gray-700 transition-all duration-300 ease-in-out placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:h-16"
                            />
                        </div>
                        <button
                            className={`w-full ${
                                isDisabled
                                    ? "bg-black"
                                    : "bg-black hover:bg-black/50"
                            } text-xs font-semibold text-white transition-colors sm:col-span-2 md:text-xl`}
                            disabled={isDisabled}
                            type="submit"
                        >
                            Login
                        </button>
                    </div>
                    <p className="m-2 w-full border-b" />
                    <Link
                        href={"/register"}
                        className="flex w-full justify-center bg-black px-6 py-3 text-xs text-white transition-colors duration-300 ease-in-out hover:bg-black/50 md:text-base"
                    >
                        Join us
                    </Link>
                    <div className="grid w-full grid-cols-1 gap-4 text-xs sm:grid-cols-2 md:text-base">
                        <button
                            onClick={() => loginHandler("naver")}
                            className="col-span-1 bg-[#03C75A] px-6 py-3 text-white transition-all duration-300 hover:bg-[#03C75A]/40"
                            type="button"
                        >
                            <div className="flex justify-center">
                                <SiNaver className="me-3 mt-[0.2em] sm:me-5" />
                                Login with Naver
                            </div>
                        </button>

                        <button
                            onClick={() => loginHandler("kakao")}
                            className="col-span-1 bg-[#FEE500] px-6 py-3 text-black transition-all duration-300 hover:bg-[#FEE500]/40"
                            type="button"
                        >
                            <div className="flex justify-center">
                                <RiKakaoTalkFill className="me-3 size-5 sm:me-5" />
                                Login with Kakao
                            </div>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginClient;
