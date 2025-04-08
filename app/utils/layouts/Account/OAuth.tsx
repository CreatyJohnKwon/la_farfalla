"use client";

import { signIn } from "next-auth/react";

const OAuth = () => {
    return (
        <div className="flex flex-col justify-between h-full w-auto text-2xl c_base:text-5xl font-thin">
            <button className="mt-10 p-2 relative rounded-lg bg-gray-400 hover:bg-green-300 transition-all duration-300" onClick={() => signIn("naver", { redirect: true, callbackUrl: "/" })}>
                Naver Login
            </button>
            <button className="mt-10 p-2 relative rounded-lg bg-gray-400 hover:bg-yellow-300 transition-all duration-300" onClick={() => signIn("kakao", { redirect: true, callbackUrl: "/" })}>
                Kakao Login
            </button>
        </div>
    );
};

export default OAuth;