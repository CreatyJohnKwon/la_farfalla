"use client";

import { useState, useRef, useEffect } from "react";
import { Shop } from "@/src/entities/interfaces";
import useSection from "@/src/shared/hooks/useSection";

const SectionDrop = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const { setSection, category } = useSection();

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
        <div
            ref={ref}
            className="font-brand z-50 ms-8 transition-all duration-300 ease-in-out c_base:me-7"
        >
            <button onClick={() => setOpen((prev) => !prev)}>season</button>
            {open && (
                <ul
                    className={`font-brand-light absolute mt-2 overflow-hidden bg-transparent transition-all duration-700 ease-in-out ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"} `}
                >
                    {category?.map((list: Shop) => (
                        <li key={list._id} className="py-1">
                            <button onClick={() => setSection(list.key)}>
                                {list.title}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SectionDrop;
