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
            <label className="mb-1 block text-xl font-semibold text-black">
                {title} <span className="text-gray-800">*</span>
            </label>
            <div
                className="w-full cursor-pointer border border-gray-300 bg-white px-4 py-3 pr-10 text-xl text-gray-800"
                onClick={() => setOpen(!open)}
            >
                {selected || `${title} (필수)`}
                <IoChevronDown className="ointer-events-none absolute right-3 top-12 text-black" />
            </div>

            {open && (
                <ul className="absolute z-10 mt-1 w-full border border-gray-200 bg-white shadow-md">
                    {items.map((item, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(item)}
                            className="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
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
