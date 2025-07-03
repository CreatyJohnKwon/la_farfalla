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
            className={`${hidden ? "hidden" : "block"} ${textColor} fixed bottom-0 w-screen text-center text-[10px] sm:text-sm`}
        >
            <div className="-mb-1">
                <span className="font-amstel">business license : lafarfalla</span>
                <span className="ms-1 font-pretendard font-[300]">(라파팔라)</span>
                <span className="font-amstel">{"\t|\t177-24-01663"}</span>
                <span className="font-amstel">{"\t|\tYOO HYEON JU"}</span>
            </div>
            <p className="-mb-1 font-amstel">
                address: 15-5, Jangwol-ro 2-gil, Seongbuk-gu SEOUL, 02773, KOREA
            </p>
            <p className="mb-2 font-amstel">mon to fri 9:00 - 19:00</p>
        </div>
    );
};

export default Footer;
