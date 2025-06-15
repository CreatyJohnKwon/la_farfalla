"use client";

import { useState, useRef, useEffect } from "react";
import { Season } from "@src/entities/type/interfaces";
import useProduct from "@src/shared/hooks/useProduct";
import { useRouter } from "next/navigation";

const ShopDrop = ({ category }: { category: Season[] }) => {
    const ref = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const { setSection, setOpenSidebar } = useProduct();

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
        <div ref={ref} className="font-amstel relative z-40">
            <button onClick={() => setOpen((prev) => !prev)}>shop</button>
            {open && (
                <ul
                    className={`mt-2 w-full overflow-hidden bg-transparent py-2 text-[0.75em] font-light transition-all sm:absolute sm:top-full sm:w-max sm:px-0 sm:text-[1em] ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"} `}
                >
                    <li key={"default_all"} className="py-1">
                        <button
                            onClick={() => {
                                setSection("");
                                setOpen(false);
                                setOpenSidebar(false);
                                router.push("/shop");
                            }}
                        >
                            All
                        </button>
                    </li>
                    {category.map((list: Season) => (
                        <li key={list._id} className="py-1">
                            <button
                                onClick={() => {
                                    setSection(list.title);
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
