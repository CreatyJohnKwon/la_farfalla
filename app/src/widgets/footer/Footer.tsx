"use client";

import { useState } from "react";
import usePage from "@/src/shared/hooks/usePage";
import License from "./License";

const Footer = () => {
    const { pathName, instagramHandler } = usePage();
    const [isLicenseVisible, setIsLicenseVisible] = useState(false);

    const toggleLicenseVisibility = () => {
        setIsLicenseVisible(prev => !prev);
    };

    if (pathName.includes("/admin")) {
        return null;
    }

    return (
        // 1. 부모 요소에 'relative'를 추가하여 자식의 absolute 포지셔닝 기준으로 만듭니다.
        <footer className={`w-full y-full ${pathName === "/home" ? "mt-0" : "mt-[20vh]"} w-[90vw] sm:w-[95vw] ps-5 sm:ps-10`}>
            <div className="flex flex-col justify-center items-center w-full y-full relative">
                {/* 2. License 래퍼 div의 스타일을 absolute 포지셔닝 및 transform 애니메이션으로 변경합니다. */}
                <div
                    className={`
                        absolute bottom-full left-0 w-full
                        transition-all duration-300 ease-in-out
                        ${isLicenseVisible
                            ? 'opacity-100 visible translate-y-0'   // 보일 때: 완전히 보이고 제자리로
                            : 'opacity-0 invisible translate-y-4'   // 숨길 때: 투명하고 아래로 살짝 이동
                        }
                    `}
                >
                    {/* License 컴포넌트에 배경색이나 테두리가 없다면 가독성을 위해 추가해주는 것이 좋습니다. */}
                    <div className={`bg-transparent ${pathName === "/home" ? "text-white pb-5 sm:pb-10" : "text-black pb-5"}`}>
                        <License />
                    </div>
                </div>

                {/* 버튼들은 기존과 동일합니다. */}
                <div className="flex flex-row h-12 sm:h-20 w-full text-black font-amstel justify-start items-center gap-10 text-sm sm:text-lg md:text-xl c_xl:text-2xl">
                    <span className="cursor-pointer" onClick={toggleLicenseVisibility}>
                        license
                    </span>
                    <span className="cursor-pointer" onClick={instagramHandler}>
                        instagram
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;