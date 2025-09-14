"use client";

import useUsers from "@/src/shared/hooks/useUsers";
import usePage from "@src/shared/hooks/usePage";
import DropdownMenu from "@src/widgets/drop/DropdownMenu";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const Sidebar = () => {
    const {
        sideBarMenuData,
        animationClass,
        isCategoryLoad,
        category,
        shopMenuItems,
        openSidebar,
        setAnimationClass,
        onCloseSidebar
    } = usePage();
    const { session, logoutHandler } = useUsers();
    const [backdropOpacityClass, setBackdropOpacityClass] = useState("bg-black/0");
    const [isClient, setIsClient] = useState<boolean>(false);
    const firstRender = useRef(true);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
            setBackdropOpacityClass("bg-black/0");
            setAnimationClass("");
            return;
        }

        if (openSidebar) {
            waitforSlideOpen();
        } else {
            setBackdropOpacityClass("bg-black/0");
            setAnimationClass("animate-slide-out-left");
        }
    }, [openSidebar]);

    const waitforSlideOpen = () => {
        setAnimationClass("animate-slide-in-left")
        setTimeout(() => setBackdropOpacityClass("bg-black/50"), 100);
    }

    if (animationClass === "animate-slide-out-left" && !openSidebar) {
        setTimeout(() => {
            setAnimationClass("");
        }, 500);
    }

    if (animationClass === "") return null;

    return (
        !isCategoryLoad &&
        category && (
            <div 
                className={`fixed inset-0 z-50 transition-colors duration-500 ${backdropOpacityClass}`}
                onClick={() => onCloseSidebar()}
            >
                <div 
                    className={`fixed left-0 top-0 h-full w-[72vw] bg-white z-50 ${animationClass}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="relative flex h-full w-full flex-col items-center justify-center">
                        <button
                            className="absolute left-4 top-3 mt-0.5 text-2xl font-amstel font-[500] text-black"
                            onClick={() => onCloseSidebar()}
                        >
                            &times;
                        </button>
                        
                        <ul className="absolute top-36 gap-4 left-6 flex flex-col items-start text-start text-lg text-black font-amstel">
                            <li className="relative -mb-1.5" key={"shop-menu"}>
                                {isClient && <DropdownMenu 
                                    title="SHOP"
                                    items={shopMenuItems}
                                    triggerType="click"
                                />}
                            </li>
                            {sideBarMenuData.map((data: any, index: number) =>
                                <li className="relative sm:transition-all sm:duration-300 sm:ease-in-out" key={index}>
                                    <Link href={data.link} onClick={() => onCloseSidebar()}>{data.label}</Link>
                                </li>
                            )}
                            {session?.user?.email &&
                                <li 
                                    className="relative sm:transition-all sm:duration-300 sm:ease-in-out"
                                    key={"logout-button"}
                                    onClick={() => logoutHandler()}
                                >
                                    LOGOUT
                                </li>
                            }
                        </ul>
                    </div>
                </div>
            </div>
        )
    );
};

export default Sidebar;