"use client";

import { useState, useRef, useEffect } from "react";
import { Products } from "@/src/entities/type/interfaces";
import useSection from "@/src/shared/hooks/useSection";

const ShopDrop = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { category, moveToShop } = useSection();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            ref={ref}
            className="font-brand z-50 ms-8 transition-all duration-300 ease-in-out"
        >
            <button onClick={() => setOpen((prev) => !prev)}>shop</button>
            {open && (
                <ul
                    className={`font-brand font-light absolute mt-2 overflow-hidden bg-transparent transition-all duration-700 ease-in-out ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"} `}
                >
                    {category?.map((list: Products) => (
                        <li key={list._id} className="py-1">
                            <button onClick={() => moveToShop(list.key)}>
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
