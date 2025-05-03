"use client";

import { useState, useRef, useEffect } from "react";
import { Products } from "@/src/entities/type/interfaces";
import useSection from "@/src/shared/hooks/useSection";

const SeasonDrop = () => {
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
            className="font-brand z-40 transition-all duration-300 ease-in-out"
        >
            <button onClick={() => setOpen((prev) => !prev)}>Season</button>
            {open && (
                <ul
                    className={`font-brand absolute mt-2 overflow-hidden bg-transparent font-light transition-all duration-700 ease-in-out ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"} `}
                >
                    {category?.map((list: Products) => (
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

export default SeasonDrop;
