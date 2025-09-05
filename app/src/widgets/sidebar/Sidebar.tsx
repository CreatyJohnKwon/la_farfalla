"use client";

import usePage from "@src/shared/hooks/usePage";
import Link from "next/link";

import { HiOutlineShoppingBag } from "react-icons/hi2";
import { IoCloseOutline } from "react-icons/io5";
import { RxInstagramLogo } from "react-icons/rx";
import { AiOutlineUser } from "react-icons/ai";
import DropdownMenu from "@/src/widgets/drop/DropdownMenu";
import { useEffect } from "react";

const Sidebar = () => {
    const {
        session,
        instagramHandler,
        setCartView,
        setOpenSidebar,
        menuData,
        menuTitle,
        isVisible,
        animationClass,
        isCategoryLoad,
        category,
        shopMenuItems,
        openSidebar,
        setIsVisible,
        setAnimationClass,
    } = usePage();

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
            <div className={`fixed inset-0 z-50 w-full bg-white ${animationClass}`}>
                <div className="relative flex h-full w-full flex-col items-center justify-center">
                    {/* 상단 UI (동일) */}
                    <button
                        className="absolute left-4 top-5 text-2xl text-black"
                        onClick={() => setOpenSidebar(false)}
                    >
                        <IoCloseOutline />
                    </button>
                    <div className="font-amstel absolute left-1/2 top-8 -translate-x-1/2 -translate-y-1/3 text-base">
                        <Link href="/home" onClick={() => setOpenSidebar(false)}>
                            La farfalla
                        </Link>
                    </div>
                    <ul className="absolute right-4 top-5 flex space-x-2 transition-all duration-300 ease-in-out">
                        <button
                            onClick={() => {
                                setOpenSidebar(false);
                                setCartView(true);
                            }}
                            className={`${session ? "block" : "hidden"}`}
                        >
                            <HiOutlineShoppingBag className={`me-4 text-2xl text-black ${session ? "block" : "hidden"}`} />
                        </button>
                        <Link href={session ? "/profile" : "/login"} onClick={() => setOpenSidebar(false)}>
                            <AiOutlineUser className={`me-2 text-2xl text-black`} />
                        </Link>
                    </ul>
                    
                    {/* 메뉴 리스트 */}
                    <ul className="absolute top-1/4 flex flex-col items-center gap-8 text-center text-3xl text-black">
                        <li className="relative">
                            {/* ShopDrop을 DropdownMenu로 완벽하게 대체 */}
                            <DropdownMenu 
                                title="shop"
                                items={shopMenuItems}
                                triggerType="click" 
                            />
                        </li>
                        <li className="relative">
                            <DropdownMenu 
                                title={menuTitle}
                                items={menuData}
                                triggerType="click"
                            />
                        </li>
                    </ul>

                    {/* 하단 UI (동일) */}
                    <ul className="absolute bottom-1/4 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center">
                        <li>
                            <button onClick={() => instagramHandler()} className="text-3xl text-black">
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

