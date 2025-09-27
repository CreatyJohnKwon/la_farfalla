"use client";


import { FaPlay } from "react-icons/fa";
import { SiNaver } from "react-icons/si";
import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";
import { RiKakaoTalkFill } from "react-icons/ri";

import Link from "next/link";
import useUsers from "@src/shared/hooks/useUsers";
import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import FindPasswordModal from "@/src/widgets/modal/user/FindPasswordModal";
import loginAction from "./actions";

const LoginClient = () => {
    const [pwdVisible, setPwdVisible] = useState<boolean>(false);
    const [isFindPasswordModalOpen, setIsFindPasswordModalOpen] =
        useState<boolean>(false);
    const [lastLoginMethod, setLastLoginMethod] = useState<string | null>(null); // ✨ 추가: 마지막 로그인 방법 상태

    const {
        email,
        password,
        isDisabled,
        rememberMe,
        setEmail,
        setPassword,
        setIsDisabled,
        setRememberMe,
    } = useUsers();

    const { loginHandler } = useUsers();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    useEffect(() => {
        setIsDisabled(email.trim() === "" || password.trim() === "");
    }, [email, password]);

    // ✨ 추가: 컴포넌트 마운트 시 localStorage에서 값 불러오기
    useEffect(() => {
        const method = localStorage.getItem("lastLoginMethod");
        if (method) {
            setLastLoginMethod(method);
        }
    }, []);

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
    }, [searchParams, router, pathname]); // 의존성 배열 추가

    // ✨ 변경: 이메일/비밀번호 로그인 액션 핸들러
    const handleCredentialsLogin = (formData: FormData) => {
        localStorage.setItem("lastLoginMethod", "credentials"); // 서버 액션 호출 직전에 저장
        loginAction(formData);
    };

    // ✨ 변경: 소셜 로그인 핸들러
    const handleSocialLogin = (provider: "naver" | "kakao") => {
        localStorage.setItem("lastLoginMethod", provider); // 소셜 로그인 호출 직전에 저장
        loginHandler(provider); // 기존 useUsers 훅의 함수
    };

    return (
        <div className="h-screen w-screen">
            <div className="flex h-full w-auto flex-col items-center justify-center text-center">
                <form
                    className="flex w-5/6 flex-col items-center justify-center gap-6 sm:w-7/12 lg:w-5/12"
                    action={handleCredentialsLogin}
                >
                    <input
                        type="hidden"
                        name="rememberMe"
                        value={String(rememberMe)}
                    />
                    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-6 relative">
                        <div className="flex w-full flex-col gap-4 text-xs sm:col-span-4 md:text-base">
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="이메일을 입력하세요"
                                className="h-12 w-full rounded-none border border-gray-200 bg-gray-50 px-4 font-pretendard text-black transition-all duration-300 ease-in-out placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:h-14"
                            />
                            <div className="relative w-full">
                                <input
                                    type={pwdVisible ? "text" : "password"}
                                    name="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="패스워드를 입력하세요"
                                    className="h-12 w-full rounded-none border border-gray-200 bg-gray-50 px-4 font-pretendard text-black transition-all duration-300 ease-in-out placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 sm:h-14"
                                />
                                <button
                                    type="button"
                                    onClick={() => setPwdVisible(!pwdVisible)}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-transparent p-4 text-black"
                                >
                                    {!pwdVisible ? (
                                        <FaRegEyeSlash />
                                    ) : (
                                        <FaRegEye />
                                    )}
                                </button>
                            </div>
                        </div>
                        <button
                            className={`w-full ${
                                isDisabled
                                    ? "bg-black"
                                    : "bg-black hover:bg-black/50"
                            } font-amstel px-6 py-3 text-xs font-semibold text-white transition-colors sm:col-span-2 md:text-xl relative`} // relative 추가
                            disabled={isDisabled}
                            type="submit"
                        >
                            Login
                            {lastLoginMethod === 'credentials' && (
                                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-center bg-gray-700 text-white text-[0.65rem] font-pretendard px-2 py-1 rounded-full whitespace-nowrap z-10">
                                    최근 사용
                                    <FaPlay className="absolute top-[-5px] left-1/2 -translate-x-1/2 text-gray-700 -rotate-90 text-[0.4rem]" />
                                </div>
                            )}
                        </button>
                    </div>

                    <div className="flex w-full items-center justify-between text-xs sm:text-sm text-prtendard">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                className="h-4 w-4 cursor-pointer"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                            />
                            <label
                                htmlFor="rememberMe"
                                className="cursor-pointer text-gray-600"
                            >
                                로그인 상태 유지
                            </label>
                        </div>
                        <span
                            className="cursor-pointer text-center text-black sm:text-black/50 hover:text-black"
                            onClick={() => setIsFindPasswordModalOpen(true)}
                        >
                            비밀번호 찾기
                        </span>
                    </div>

                    <Link
                        href={"/register"}
                        className="font-amstel flex w-full justify-center bg-black px-6 py-3 text-xs text-white transition-colors duration-300 ease-in-out hover:bg-black/50 md:text-base"
                    >
                        Join us
                    </Link>
                    <div className="w-full flex grid-rows-11 text-center justify-center items-center">
                        <span className="w-full border-b border-gray-200 row-span-5"/>
                        <span className="w-full font-amstel-thin text-xs text-gray-700">Social</span>
                        <span className="w-full border-b border-gray-200 row-span-5"/>
                    </div>
                    <div className="font-amstel grid w-full grid-cols-1 gap-4 text-xs lg:grid-cols-2 md:text-base">
                        <button
                            onClick={() => handleSocialLogin("naver")}
                            className="col-span-1 bg-[#03C75A] px-6 py-3 text-white transition-all duration-300 hover:bg-[#03C75A]/40 relative" // relative 추가
                            type="button"
                        >
                            <div className="flex justify-center truncate">
                                <SiNaver className="me-3 mt-[0.2em] sm:me-5" />
                                <span className="text-sm md:text-base">
                                    Login with Naver
                                </span>
                            </div>
                            {lastLoginMethod === 'naver' && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center justify-center bg-gray-700 text-white text-[0.65rem] font-pretendard px-2 py-1 rounded-full whitespace-nowrap z-10">
                                    최근 사용
                                    <FaPlay className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 text-gray-700 rotate-90 text-[0.4rem]" />
                                </div>
                            )}
                        </button>

                        <button
                            onClick={() => handleSocialLogin("kakao")}
                            className="col-span-1 bg-[#FEE500] px-6 py-3 text-black transition-all duration-300 hover:bg-[#FEE500]/40 relative" // relative 추가
                            type="button"
                        >
                            <div className="flex justify-center truncate">
                                <RiKakaoTalkFill className="me-3 size-5 sm:me-5" />
                                <span className="text-sm md:text-base">
                                    Login with Kakao
                                </span>
                            </div>
                            {lastLoginMethod === 'kakao' && (
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center justify-center bg-gray-700 text-white text-[0.65rem] font-pretendard px-2 py-1 rounded-full whitespace-nowrap z-10">
                                    최근 사용
                                    <FaPlay className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 text-gray-700 rotate-90 text-[0.4rem]" />
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
            {isFindPasswordModalOpen && (
                <FindPasswordModal
                    onClose={() => setIsFindPasswordModalOpen(false)}
                />
            )}
        </div>
    );
};

export default LoginClient;