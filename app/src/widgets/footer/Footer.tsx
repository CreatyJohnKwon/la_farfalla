"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const Footer = () => {
    const pathName = usePathname();
    const [hidden, setHidden] = useState<boolean>(false);
    const [textColor, setTextColor] = useState<string>("text-white");

    useEffect(() => {
        // pathName;
        switch (pathName) {
            case "/":
            case "/home":
                setHidden(false);
                setTextColor("text-white");
                break;
            case "/introduce":
            case "/project":
                setHidden(false);
                setTextColor("text-black");
                break;
            default:
                setHidden(true);
                setTextColor("text-black");
                break;
        }
    }, [pathName]);

    return (
        <div
            className={`${hidden ? "hidden" : "block"} ${textColor} fixed bottom-0 w-screen pb-2 text-center font-pretendard text-[10px] font-[200] sm:text-xs`}
        >
            <p className="tracking-wide">라파팔라, 010-6788-3834 유현주</p>
            <p className="tracking-wide">
                사업지주소. 서울특별시 성북구 한천로78길 12-22, 1층
            </p>
            <span className="tracking-wide">
                사업자등록번호. 177-24-01663, 통신판매번호. 2024-서울성북-1347
            </span>
        </div>
    );
};

export default Footer;
