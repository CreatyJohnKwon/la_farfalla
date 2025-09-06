"use client";

import { useState } from "react";
import usePage from "@/src/shared/hooks/usePage";
import License from "./License";

const Footer = () => {
    const { pathName, instagramHandler } = usePage();
    
    // License 컴포넌트의 표시 여부만 관리하면 됩니다.
    const [isLicenseVisible, setIsLicenseVisible] = useState(false);

    // 핸들러를 매우 간단하게 수정합니다.
    const toggleLicenseVisibility = () => {
        setIsLicenseVisible(prev => !prev);
    };

    if (pathName.includes("/admin")) {
        return null
    }

    return (
        <footer className="flex flex-col justify-center items-center py-4">
            <div 
                className={`
                    w-full transition-all duration-300 ease-in-out overflow-hidden
                    ${isLicenseVisible ? 'max-h-96 opacity-100 visible mt-4' : 'max-h-0 opacity-0 invisible'}
                `}
            >
                <License />
            </div>

            {/* 각 버튼 */}
            <div className="flex flex-row h-12 sm:h-20 w-[90vw] sm:w-[92vw] text-black font-amstel justify-start items-center gap-10 text-base sm:text-xl md:text-2xl c_xl:text-3xl">
                <span className="cursor-pointer" onClick={toggleLicenseVisibility}>
                    license
                </span>
                <span className="cursor-pointer" onClick={instagramHandler}>
                    instagram
                </span>
            </div>
        </footer>
    );
};

export default Footer;