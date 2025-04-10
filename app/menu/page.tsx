"use client";

import Link from "next/link";
import { menuData } from "@/utils/context/dummy";
import { useEffect, useState, useRef } from "react";
import { MenuItem, ChildItem } from "@/utils/types/interfaces";

const Menu = () => {
    const [openShop, setOpenShop] = useState(false);
    const [openNotice, setOpenNotice] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpenShop(false);
                setOpenNotice(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const menuFilter = (menuList: MenuItem, index: number) => {
        if (menuList.text === "Shop") {
            return (
                <li key={index} className="mt-3">
                    <button onClick={() => setOpenShop((prev) => !prev)}>
                        {menuList.text}
                    </button>
                    {openShop && (
                        <ul
                            className={`font-brand mb-5 mt-2 bg-transparent text-xl transition-all duration-700 ease-in-out c_md:text-5xl ${openShop ? "opacity-100" : "opacity-0"} `}
                        >
                            {menuList.child?.map(
                                (childList: ChildItem, i: number) => (
                                    <li key={`child${i}`} className="py-1">
                                        <Link
                                            href={`${menuList.link}?session=${childList.query}`}
                                        >
                                            {childList.text}
                                        </Link>
                                    </li>
                                ),
                            )}
                        </ul>
                    )}
                </li>
            );
        } else if (menuList.text === "Notice") {
            return (
                <li key={index} className="mt-3">
                    <button onClick={() => setOpenNotice((prev) => !prev)}>
                        {menuList.text}
                    </button>
                    {openNotice && (
                        <ul
                            className={`font-brand mb-5 mt-2 bg-transparent text-xl transition-all duration-700 ease-in-out c_md:text-5xl ${openNotice ? "opacity-100" : "opacity-0"} `}
                        >
                            <li className="py-1">
                                <Link href={`${menuList.link}?cs`}>C/S</Link>
                            </li>
                            <li className="py-1">
                                <Link href={`${menuList.link}?qa`}>QA</Link>
                            </li>
                        </ul>
                    )}
                </li>
            );
        } else {
            return (
                <li key={index} className="mt-3">
                    <Link href={`${menuList.link}`}>{menuList.text}</Link>
                </li>
            );
        }
    };

    return (
        <div className="flex h-screen w-5/6 flex-col items-end justify-center text-end">
            <ul className="font-brand -me-10 text-4xl transition-all duration-700 ease-in-out c_md:-me-0 c_md:text-7xl">
                {menuData.map((menuList, index) => menuFilter(menuList, index))}
            </ul>
        </div>
    );
};

export default Menu;
