"use client";

import usePage from "@/src/shared/hooks/usePage";
import useSection from "@/src/shared/hooks/useSection";
import useUsers from "@/src/shared/hooks/useUsers";
import Link from "next/link";
import { useEffect, useState } from "react";

import { HiOutlineShoppingBag } from "react-icons/hi2";
import { IoCloseOutline } from "react-icons/io5";
import { RxInstagramLogo } from "react-icons/rx";
import { AiOutlineUser } from "react-icons/ai";
import ShopDrop from "../drop/ShopDrop";
import AboutDrop from "../drop/AboutDrop";

const Sidebar = () => {
    const { openSidebar, setOpenSidebar } = useSection();
    const [isVisible, setIsVisible] = useState(false);
    const [animationClass, setAnimationClass] = useState(
        "animate-slide-in-left",
    );

    const { session } = useUsers();
    const { instagramHandler } = usePage();

    useEffect(() => {
        if (openSidebar) {
            setIsVisible(true);
            setAnimationClass("animate-slide-in-left");
        } else {
            setAnimationClass("animate-slide-out-left");
            setTimeout(() => {
                setIsVisible(false);
            }, 300);
        }
    }, [openSidebar]);

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-50 w-full bg-white ${animationClass}`}>
            <div className="relative flex h-full w-full flex-col items-center justify-center">
                <button
                    className="absolute left-4 top-4 text-[2em] text-black"
                    onClick={() => setOpenSidebar(false)}
                >
                    <IoCloseOutline />
                </button>

                <div className="font-amstel absolute top-5 text-[1.25em]">
                    <Link href="/home" onClick={() => setOpenSidebar(false)}>
                        La farfalla
                    </Link>
                </div>

                <ul className="absolute right-5 top-5 flex space-x-2 transition-all duration-300 ease-in-out">
                    <Link
                        href={session ? "/profile" : "/login"}
                        onClick={() => setOpenSidebar(false)}
                    >
                        <AiOutlineUser
                            className={`text-[1.5em] text-black ${session ? "me-4" : "me-0"}`}
                        />
                    </Link>

                    <Link
                        href={"/cart"}
                        onClick={() => setOpenSidebar(false)}
                        className={`${session ? "block" : "hidden"}`}
                    >
                        <HiOutlineShoppingBag
                            className={`me-1 text-[1.5em] text-black`}
                        />
                    </Link>
                </ul>

                <ul className="font-amstel -mt-20 flex flex-col space-y-10 text-center text-[2em] text-black">
                    <li>
                        <ShopDrop />
                    </li>
                    <li>
                        <AboutDrop />
                    </li>

                    <li>
                        <button
                            onClick={() => instagramHandler()}
                            className="mt-36 text-[1em] text-black"
                        >
                            <RxInstagramLogo />
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
