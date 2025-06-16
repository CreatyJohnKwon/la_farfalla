"use client";

import { useState, useEffect, useRef } from "react";
import { IoChevronDown } from "react-icons/io5";

const ProductDrop = ({
    title,
    items,
    selected,
    setSelected,
}: {
    title: string;
    items: string[];
    selected: string;
    setSelected: React.Dispatch<React.SetStateAction<string>>;
}) => {
    const [open, setOpen] = useState(false);

    const dropRef = useRef<HTMLDivElement>(null);

    const handleSelect = (value: string) => {
        setSelected(value);
        setOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropRef.current &&
                !dropRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={dropRef} className="font-amstel relative w-full">
            <label className="mb-1 block text-xs font-semibold text-black md:text-sm">
                {title} <span className="text-gray-800">*</span>
            </label>
            <div
                className="relative w-full cursor-pointer border border-gray-300 bg-white px-3 py-2 pr-8 text-xs text-gray-800 md:px-4 md:pr-10 md:text-sm"
                onClick={() => setOpen(!open)}
            >
                {selected || `${title} (필수)`}
                <IoChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-black md:right-3" />
            </div>

            {open && (
                <ul className="absolute z-20 max-h-40 w-full overflow-y-auto border border-gray-200 bg-white shadow-md md:max-h-48">
                    {items.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(item)}
                            className="cursor-pointer px-3 py-2 text-xs transition-colors hover:bg-gray-100 md:px-4 md:text-sm"
                        >
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ProductDrop;
