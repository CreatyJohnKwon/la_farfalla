"use client";

import { signIn } from "next-auth/react";

const OAuth = () => {
    const loginHandler = (provider: string | "") => {
        signIn(provider, { redirect: true, callbackUrl: "/" });
    };

    return (
        <div className="flex h-full w-auto flex-col justify-between text-2xl font-thin c_base:text-5xl">
            <div>
                <button
                    className="relative mt-10 rounded-lg bg-green-100 p-2 transition-all duration-300 hover:bg-green-300"
                    onClick={() => loginHandler("naver")}
                >
                    네이버 로그인
                </button>
            </div>
            <div>
                <button
                    className="relative mt-10 rounded-lg bg-yellow-100 p-2 transition-all duration-300 hover:bg-yellow-300"
                    onClick={() => loginHandler("kakao")}
                >
                    카카오 로그인
                </button>
            </div>
        </div>
    );
};

export default OAuth;
