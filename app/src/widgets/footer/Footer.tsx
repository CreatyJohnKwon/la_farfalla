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
            className={`${hidden ? "hidden" : "block"} ${textColor} font-amstel fixed bottom-0 w-screen text-center text-[10px] sm:text-sm`}
        >
            <p className="tracking-wide">
                © lafarfalla 라파팔라 010-6788-3834 YOO HYEON JU
            </p>
            <p className="tracking-wide">
                address: 12-22 Hancheon-ro 78-gil, Seongbuk-gu, Seoul 02727,
                Korea
            </p>
            <span className="tracking-wide">
                사업자번호 177-24-01663 통신판매번호 2024-서울성북-1347
            </span>
        </div>
    );
};

export default Footer;
