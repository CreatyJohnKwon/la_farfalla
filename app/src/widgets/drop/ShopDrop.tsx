"use client";

import { useState, useRef, useEffect } from "react";
import { Products } from "@/src/entities/type/interfaces";
import useSection from "@/src/shared/hooks/useSection";
import { useRouter } from "next/navigation";

const ShopDrop = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { category, setSection, setOpenSidebar } = useSection();
    const router = useRouter();

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
        <div ref={ref} className="font-amstel z-40">
            <button onClick={() => setOpen((prev) => !prev)}>shop</button>
            {open && (
                <ul
                    className={`font-amstel mt-2 overflow-hidden bg-transparent text-[0.75em] font-light sm:absolute sm:text-[1em] ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"} `}
                >
                    {category?.map((list: Products) => (
                        <li key={list._id} className="py-1">
                            <button
                                onClick={() => {
                                    setSection(list.key);
                                    setOpen(false);
                                    setOpenSidebar(false);
                                    router.push("/shop");
                                }}
                            >
                                {list.title}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ShopDrop;
