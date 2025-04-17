"use client";

import { signIn } from "next-auth/react";

const OAuth = () => {
    const loginHandler = (provider: string | "") => {
        signIn(provider, { redirect: true, callbackUrl: "/" });
    };

    return (
        <div className="flex flex-col gap-6 text-xl font-brand-light">
            <button
                onClick={() => loginHandler("naver")}
                className="rounded-md bg-[#03C75A]/20 text-[#03C75A] px-6 py-3 transition-all duration-300 hover:bg-[#03C75A]/40">
                네이버 로그인
            </button>

            <button
                onClick={() => loginHandler("kakao")}
                className="rounded-md bg-[#FEE500]/40 text-[#381E1F] px-6 py-3 transition-all duration-300 hover:bg-[#FEE500]/70">
                카카오 로그인
            </button>
        </div>
    );
};

export default OAuth;
