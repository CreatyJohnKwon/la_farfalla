// src/app/(auth)/login/LoginClient.tsx

"use client";

import useUsers from "@src/shared/hooks/useUsers";
import { useEffect, useState } from "react";
import loginAction from "./actions";
import Link from "next/link";
import { SiNaver } from "react-icons/si";
import { RiKakaoTalkFill } from "react-icons/ri";
import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import FindPasswordModal from "@src/widgets/modal/FindPasswordModal";

const LoginClient = () => {
    const [pwdVisible, setPwdVisible] = useState<boolean>(false);
    const [isFindPasswordModalOpen, setIsFindPasswordModalOpen] =
        useState<boolean>(false);

    const {
        email,
        password,
        isDisabled,
        rememberMe, // 훅에서 가져온 상태
        setEmail,
        setPassword,
        setIsDisabled,
        setRememberMe, // 훅에서 가져온 상태 설정 함수
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
                    className="flex w-5/6 flex-col items-center justify-center gap-6 md:w-5/12"
                    action={loginAction}
                >
                    {/* ✨ 변경점 1: 서버 액션으로 rememberMe 상태 전달을 위한 hidden input */}
                    <input
                        type="hidden"
                        name="rememberMe"
                        value={String(rememberMe)}
                    />
                    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-6">
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
                            } font-amstel px-6 py-3 text-xs font-semibold text-white transition-colors sm:col-span-2 md:text-xl`}
                            disabled={isDisabled}
                            type="submit"
                        >
                            Login
                        </button>
                    </div>

                    {/* ✨ 변경점 2: '로그인 상태 유지' 체크박스 UI 추가 */}
                    <div className="flex w-full items-center justify-between">
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
                                className="cursor-pointer text-sm text-gray-600"
                            >
                                로그인 상태 유지
                            </label>
                        </div>
                        <span
                            className="cursor-pointer text-center text-prtendard text-xs text-gray-400 hover:text-gray-900"
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
                    <div className="font-amstel grid w-full grid-cols-1 gap-4 text-xs sm:grid-cols-2 md:text-base">
                        <button
                            onClick={() => loginHandler("naver")}
                            className="col-span-1 bg-[#03C75A] px-6 py-3 text-white transition-all duration-300 hover:bg-[#03C75A]/40"
                            type="button"
                        >
                            <div className="flex justify-center truncate">
                                <SiNaver className="me-3 mt-[0.2em] sm:me-5" />
                                <span className="text-sm md:text-base">
                                    Login with Naver
                                </span>
                            </div>
                        </button>

                        <button
                            onClick={() => loginHandler("kakao")}
                            className="col-span-1 bg-[#FEE500] px-6 py-3 text-black transition-all duration-300 hover:bg-[#FEE500]/40"
                            type="button"
                        >
                            <div className="flex justify-center truncate">
                                <RiKakaoTalkFill className="me-3 size-5 sm:me-5" />
                                <span className="text-sm md:text-base">
                                    Login with Kakao
                                </span>
                            </div>
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