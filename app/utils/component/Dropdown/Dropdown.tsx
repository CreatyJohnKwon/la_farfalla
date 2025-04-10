"use client";

import { useState, useRef, useEffect } from "react";
import { menuData } from "@/utils/context/dummy";
import { ChildItem } from "@/utils/types/interfaces";
import Link from "next/link";

const Dropdown = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const datas = menuData[1];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={ref} className="font-brand z-50 ms-7">
            <button onClick={() => setOpen((prev) => !prev)}>season</button>
            {open && (
                <ul
                    className={`font-brand-light absolute mt-2 w-48 overflow-hidden bg-transparent transition-all duration-700 ease-in-out ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"} `}
                >
                    {datas.child?.map((childList: ChildItem, i: number) => (
                        <li key={`child${i}`} className="py-1">
                            <Link
                                href={`${datas.link}?session=${childList.query}`}
                            >
                                {childList.text}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dropdown;
