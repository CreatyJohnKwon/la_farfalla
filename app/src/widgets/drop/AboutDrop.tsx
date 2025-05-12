"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import useProduct from "@/src/shared/hooks/useProduct";

const AboutDrop = () => {
    const { setOpenSidebar } = useProduct();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
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
            <button onClick={() => setOpen((prev) => !prev)}>about</button>
            {open && (
                <ul
                    className={`font-amstel mt-2 overflow-hidden bg-transparent text-[0.75em] font-light sm:absolute sm:text-[1em] ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"} `}
                >
                    <li key={"move-introduce"} className="py-1">
                        <button
                            onClick={() => {
                                router.push("/introduce");
                                setOpenSidebar(false);
                                setOpen(false);
                            }}
                        >
                            introduce
                        </button>
                    </li>
                    <li key={"move-project"} className="py-1">
                        <button
                            onClick={() => {
                                router.push("/project");
                                setOpenSidebar(false);
                                setOpen(false);
                            }}
                        >
                            project
                        </button>
                    </li>
                </ul>
            )}
        </div>
    );
};

export default AboutDrop;
