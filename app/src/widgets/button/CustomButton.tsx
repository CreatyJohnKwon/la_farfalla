"use client";

import { CustomButtonProps } from "@src/entities/type/interfaces";

const CustomButton = ({
    btnTitle,
    btnFunc,
    btnStyle,
    btnDisabled,
    btnType,
}: CustomButtonProps) => {
    return (
        <>
            <button
                onClick={() => btnFunc && btnFunc()}
                className={`w-full px-6 py-3 text-black ${btnStyle}`}
                disabled={btnDisabled}
                type={btnType}
            >
                <div className="flex justify-center text-base transition-all duration-300 ease-in-out">
                    {btnTitle}
                </div>
            </button>
        </>
    );
};

export default CustomButton;
