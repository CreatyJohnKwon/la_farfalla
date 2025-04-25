"use client";

import Navbar from "@/src/widgets/navbar/Navbar";
import LoginButton from "@/src/components/button/LoginButton";
import useUsers from "@/src/shared/hooks/useUsers";
import { useEffect } from "react";
import { loginAction } from "./actions";
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
        <>
            <Navbar />
            <div className="flex min-h-[calc(100vh-240px)] w-screen flex-col items-center justify-center bg-white px-4 text-center">
                <span className="font-brand mb-20 text-6xl transition-all duration-700 ease-in-out sm:text-8xl">
                    Login
                </span>
                <form
                    className="flex w-5/6 flex-col items-center justify-center gap-6 sm:w-3/6"
                    action={loginAction}
                >
                    <div className="font-brand grid grid-cols-1 sm:grid-cols-6 w-full gap-4">
                        <div className="sm:col-span-4 flex flex-col gap-4 text-sm md:text-lg w-full">
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="이메일을 입력하세요"
                                className="h-14 sm:h-16 w-full border border-gray-200 bg-gray-50 px-4 text-gray-700 transition-all duration-300 ease-in-out placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                            />
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호를 입력하세요"
                                className="h-14 sm:h-16 w-full border border-gray-200 bg-gray-50 px-4 text-gray-700 transition-all duration-300 ease-in-out placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                            />
                        </div>
                        <LoginButton
                            btnTitle="로그인"
                            btnStyle={`w-full ${
                                isDisabled ? "bg-black/50" : "bg-black hover:bg-black/50"
                              } text-white transition-colors text-base font-semibold sm:col-span-2`}
                            btnDisabled={isDisabled}
                            btnType="submit"
                        />
                    </div>
                    <p className="m-2 w-full border-b" />
                    <Link
                        href={"/register"}
                        className="flex w-full  justify-center bg-[#F9F5EB] hover:bg-[#EADDC8] px-6 py-3 text-base text-black transition-colors duration-300 ease-in-out sm:text-lg md:text-xl"
                    >
                        회원가입
                    </Link>
                    <div className="w-full font-brand grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => loginHandler("naver")}
                            className="col-span-1 bg-[#03C75A] px-6 py-3 text-white transition-all duration-300 hover:bg-[#03C75A]/40"
                            type="button"
                        >
                            <div className="flex justify-center ">
                                <SiNaver className="me-3 mt-[3.5px] sm:me-5" />
                                Login with Naver
                            </div>
                        </button>
    
                        <button
                            onClick={() => loginHandler("kakao")}
                            className="col-span-1 bg-[#FEE500] px-6 py-3 text-black transition-all duration-300 hover:bg-[#FEE500]/40"
                            type="button"
                        >
                            <div className="flex justify-center ">
                                <RiKakaoTalkFill className="me-3 mt-[2px] sm:me-5 size-5" />
                                Login with Kakao
                            </div>
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default LoginClient;
