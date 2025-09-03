"use client";

import usePage from "@src/shared/hooks/usePage";
import useProduct from "@src/shared/hooks/useProduct";
import useUsers from "@src/shared/hooks/useUsers";
import Link from "next/link";
import { useEffect, useState } from "react";

import { HiOutlineShoppingBag } from "react-icons/hi2";
import { IoCloseOutline } from "react-icons/io5";
import { RxInstagramLogo } from "react-icons/rx";
import { AiOutlineUser } from "react-icons/ai";
import ShopDrop from "@src/widgets/drop/ShopDrop";
import AboutDrop from "@src/widgets/drop/AboutDrop";
import useCart from "@src/shared/hooks/useCart";
import AdminDrop from "@/src/widgets/drop/AdminDrop";
import { useSeasonQuery } from "@/src/shared/hooks/react-query/useSeasonQuery";
import { adminEmails } from "public/data/common";

const Sidebar = () => {
    const { openSidebar, setOpenSidebar } = useProduct();
    const { setCartView } = useCart();
    const [isVisible, setIsVisible] = useState(false);
    const [animationClass, setAnimationClass] = useState(
        "animate-slide-in-left",
    );
    const { data: category, isLoading: isCategoryLoad } = useSeasonQuery();

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
        !isCategoryLoad &&
        category && (
            <div
                className={`fixed inset-0 z-50 w-full bg-white ${animationClass}`}
            >
                <div className="relative flex h-full w-full flex-col items-center justify-center">
                    <button
                        className="absolute left-4 top-4 text-[2em] text-black"
                        onClick={() => setOpenSidebar(false)}
                    >
                        <IoCloseOutline />
                    </button>

                    <div className="font-amstel absolute left-1/2 top-8 -translate-x-1/2 -translate-y-1/3 text-base">
                        <Link
                            href="/home"
                            onClick={() => setOpenSidebar(false)}
                        >
                            La farfalla
                        </Link>
                    </div>

                    <ul className="absolute right-5 top-5 flex space-x-2 transition-all duration-300 ease-in-out">
                        <button
                            onClick={() => {
                                setOpenSidebar(false);
                                setCartView(true);
                            }}
                            className={`${session ? "block" : "hidden"}`}
                        >
                            <HiOutlineShoppingBag
                                className={`me-4 text-[1.5em] text-black ${session ? "block" : "hidden"}`}
                            />
                        </button>

                        <Link
                            href={session ? "/profile" : "/login"}
                            onClick={() => setOpenSidebar(false)}
                        >
                            <AiOutlineUser
                                className={`me-2 text-[1.5em] text-black`}
                            />
                        </Link>
                    </ul>

                    <ul className="flex flex-col items-center gap-8 text-center text-3xl text-black absolute top-1/4">
                        <li className="relative">
                            <ShopDrop category={category} />
                        </li>
                        <li className="relative">
                            {session &&
                            adminEmails.includes(session?.user?.email ?? "") ? (
                                <AdminDrop />
                            ) : (
                                <AboutDrop />
                            )}
                        </li>
                    </ul>

                    {/* 하단에 고정될 메뉴 리스트와 인스타그램 아이콘 */}
                    <ul className="absolute bottom-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center">
                        <li>
                            <button
                                onClick={() => instagramHandler()}
                                className="text-3xl text-black"
                            >
                                <RxInstagramLogo />
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        )
    );
};

export default Sidebar;
