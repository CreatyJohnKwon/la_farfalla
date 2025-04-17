"use client";

import { LoginButtonProps } from "@/src/entities/interfaces";

const LoginButton = ({ btnTitle, btnFunc, btnColor }: LoginButtonProps) => {
    return (
        <>
            <button
                onClick={() => btnFunc()}
                className={`w-full rounded-md px-6 py-3 text-black ${btnColor}`}
            >
                <div className="flex justify-center text-base transition-all duration-300 ease-in-out sm:text-lg md:text-xl">
                    {btnTitle}
                </div>
            </button>
        </>
    );
};

export default LoginButton;
