"use client";

import { LoginButtonProps } from "@/src/entities/type/interfaces";

const LoginButton = ({
    btnTitle,
    btnFunc,
    btnColor,
    btnDisabled,
    btnType,
}: LoginButtonProps) => {
    return (
        <>
            <button
                onClick={() => btnFunc && btnFunc()}
                className={`w-full rounded-md px-6 py-3 text-black ${btnColor}`}
                disabled={btnDisabled}
                type={btnType}
            >
                <div className="flex justify-center text-base transition-all duration-300 ease-in-out sm:text-lg md:text-xl">
                    {btnTitle}
                </div>
            </button>
        </>
    );
};

export default LoginButton;
