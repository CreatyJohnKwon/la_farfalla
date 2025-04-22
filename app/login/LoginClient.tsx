"use client";

import Navbar from "@/src/widgets/navbar/Navbar";
import LoginButton from "@/src/components/button/LoginButton";
import OAuth from "@/src/components/button/OAuth";
import useUsers from "@/src/shared/hooks/useUsers";
import { useEffect } from "react";
import { getLogin } from "@/src/shared/lib/get";
import Link from "next/link";

const LoginClient = () => {
    const {
        email,
        password,
        isDisabled,
        isOpenOAuth,
        setEmail,
        setPassword,
        setIsDisabled,
        setIsOpenOAuth,
    } = useUsers();

    useEffect(() => {
        setIsDisabled(email.trim() === "" || password.trim() === "");
    }, [email, password]);

    return (
        <>
            <Navbar />
            <div className="flex min-h-[calc(100vh-240px)] flex-col items-center justify-center bg-white px-4 text-center">
                <span className="font-brand mb-20 text-6xl transition-all duration-700 ease-in-out sm:text-8xl">
                    Login
                </span>
                <form
                    className="flex w-5/6 flex-col items-center justify-center gap-6 sm:w-3/6"
                    action={getLogin}
                >
                    <div className="flex w-full flex-col gap-4 text-base md:text-lg">
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="이메일을 입력하세요"
                            className="h-16 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-700 transition-all duration-300 ease-in-out placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            className="h-16 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-700 transition-all duration-300 ease-in-out placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>
                    <div className="font-brand flex w-full justify-center gap-4">
                        <LoginButton
                            btnTitle="로그인"
                            btnColor={`${isDisabled ? "bg-black/50" : "bg-black hover:bg-black/50"}  text-white transition-colors`}
                            btnDisabled={isDisabled}
                            btnType="submit"
                        />
                        <LoginButton
                            btnTitle="간편 로그인"
                            btnFunc={() => setIsOpenOAuth(true)}
                            btnColor="bg-[#F9F5EB] hover:bg-[#EADDC8] transition-colors"
                            btnType="button"
                        />
                    </div>
                    <p className="m-2 w-full border-b" />
                    <Link
                        href={"/register"}
                        className="flex w-full justify-center rounded-md bg-black/10 px-6 py-3 text-base text-black transition-colors duration-300 ease-in-out hover:bg-black/30 sm:text-lg md:text-xl"
                    >
                        회원가입
                    </Link>
                    {isOpenOAuth && <OAuth />}
                </form>
            </div>
        </>
    );
};

export default LoginClient;
