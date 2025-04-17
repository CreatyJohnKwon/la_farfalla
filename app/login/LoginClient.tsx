"use client";

import Navbar from "@/src/widgets/Navbar/Navbar";
import LoginButton from "../src/features/Login/LoginButton";
import OAuth from "@/src/features/Login/OAuth";
import useUsers from "@/src/shared/hooks/useUsers";

const LoginClient = () => {
    const { handleAccountBtn, isOpenOAuth, setIsOpenOAuth } = useUsers();

    return (
        <>
            <Navbar />
            <div className="flex min-h-[calc(100vh-240px)] flex-col items-center justify-center bg-white px-4 text-center">
                <span className="font-brand mb-20 text-6xl transition-all duration-700 ease-in-out sm:text-8xl">
                    Login
                </span>
                <div className="flex w-5/6 flex-col items-center justify-center gap-6 sm:w-3/6">
                    <div className="flex w-full flex-col gap-4 text-base md:text-lg">
                        <input
                            type="email"
                            placeholder="이메일을 입력하세요"
                            className="h-16 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-700 transition-all duration-300 ease-in-out placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                        <input
                            type="text"
                            placeholder="비밀번호를 입력하세요"
                            className="h-16 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-700 transition-all duration-300 ease-in-out placeholder:text-gray-400 focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>
                    <div className="font-brand flex w-full justify-center gap-4">
                        <LoginButton
                            btnTitle="로그인"
                            btnFunc={() => handleAccountBtn("로그인")}
                            btnColor="bg-black hover:bg-black/50 text-white transition-colors"
                        />
                        <LoginButton
                            btnTitle="간편 로그인"
                            btnFunc={() => setIsOpenOAuth(true)}
                            btnColor="bg-[#F9F5EB] hover:bg-[#EADDC8] transition-colors"
                        />
                    </div>

                    <p className="m-2 w-full border-b" />
                    <LoginButton
                        btnTitle="회원가입"
                        btnFunc={() => handleAccountBtn("회원가입")}
                        btnColor="bg-black/10 hover:bg-black/30 transition-colors"
                    />
                    {isOpenOAuth && <OAuth />}
                </div>
            </div>
        </>
    );
};

export default LoginClient;
