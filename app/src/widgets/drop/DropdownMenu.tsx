"use client";

import { useState, useRef, useEffect } from "react";
import useProduct from "@src/shared/hooks/useProduct";
import usePage from "@src/shared/hooks/usePage";

interface DropdownMenuItem {
    label: string;
    path?: string;
    onClick?: () => void;
}

interface DropdownMenuProps {
    title: string;
    items: DropdownMenuItem[];
    triggerType?: "click" | "hover";
}

const DropdownMenu = ({ 
    title,
    items, 
    triggerType = "hover"
}: DropdownMenuProps) => {
    const { setOpenSidebar } = useProduct();
    const { router, pathName, menuBg, setMenuBg } = usePage();

    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    const clickClasses = `${open ? "max-h-96 opacity-100 visible" : "max-h-0 opacity-0 invisible"}`;
    const hoverClasses = "sm:group-hover:max-h-96 sm:group-hover:opacity-100 sm:group-hover:visible sm:max-h-0 sm:opacity-0 sm:invisible";

    useEffect(() => {
        switch (pathName) { 
            case "/home":
                setMenuBg("bg-transparent sm:pe-0");
                break;
            default:
                setMenuBg("bg-white/70 sm:pe-10");
                break;
        }
    }, [pathName, setMenuBg]);

    useEffect(() => {
        if (triggerType === "click") {
            const handleClickOutside = (event: MouseEvent) => {
                if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
            };
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [triggerType]);

    return (
        <div 
            ref={ref} 
            className={`z-40 ${triggerType === "hover" ? "group relative" : ""}`}
        >
            <button 
                className="font-amstel font-[500]"
                onClick={() => triggerType === "click" && setOpen(prev => !prev)}
            >
                {title}
            </button>
            <ul
                className={`
                    mt-2 sm:mt-4 sm:absolute text-sm font-amstel font-[500] whitespace-nowrap ${menuBg}
                    sm:transition-all sm:duration-300 ease-in-out ${hoverClasses}
                    ${triggerType === "click" ? `transition-all duration-300 ease-in-out ${clickClasses}` : ""}
                `}
            >
                {items.map((item) => (
                    item.label === "MVP" ? 
                    <li key={item.label}></li> :
                    <li key={item.label} className="py-1">
                        <button
                            onClick={() => {
                                if (item.onClick) item.onClick();
                                else if (item.path) router.push(item.path);

                                setOpenSidebar(false);
                                if (triggerType === "click") setOpen(false);
                            }}
                        >
                            {item.label}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DropdownMenu;