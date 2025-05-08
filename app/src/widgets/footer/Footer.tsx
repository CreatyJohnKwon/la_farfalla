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
            <p className="-mb-1">business license : lafarfalla</p>
            <p className="-mb-1">
                address: 15-5, Jangwol-ro 2-gil, Seongbuk-gu SEOUL, 02773, KOREA
            </p>
            <p className="mb-2">mon to fri 9:00 - 19:00</p>
        </div>
    );
};

export default Footer;
