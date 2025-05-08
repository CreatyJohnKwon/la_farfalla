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

const Sidebar = () => {
    const { openSidebar, setOpenSidebar } = useSection();
    const [isVisible, setIsVisible] = useState(false); // 화면에 보이는 여부
    const [animationClass, setAnimationClass] = useState(
        "animate-slide-in-left",
    );

    const { session } = useUsers();
    const { instagramHandler } = usePage();

    // openSidebar 바뀔 때 애니메이션 처리
    useEffect(() => {
        if (openSidebar) {
            setIsVisible(true); // 보여주기
            setAnimationClass("animate-slide-in-left");
        } else {
            setAnimationClass("animate-slide-out-left");
            setTimeout(() => {
                setIsVisible(false); // 닫힘 끝난 후 사라지기
            }, 300); // 애니메이션 시간과 맞춰야 함
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

                <div className="font-brand absolute top-5 text-[1.25em]">
                    <Link href="/home" onClick={() => setOpenSidebar(false)}>
                        La farfalla
                    </Link>
                </div>

                <ul className="absolute right-5 top-5 flex space-x-2 transition-all duration-300 ease-in-out">
                    <Link href={"/profile"}>
                        <AiOutlineUser
                            className={`me-4 text-[1.5em] text-black`}
                        />
                    </Link>

                    <Link href={"/cart"}>
                        <HiOutlineShoppingBag
                            className={`me-1 text-[1.5em] text-black`}
                        />
                    </Link>
                </ul>

                <ul className="font-brand -mt-20 space-y-6 text-center font-pretendard text-[2em] text-black">
                    <li>
                        <Link
                            href="/shop"
                            onClick={() => setOpenSidebar(false)}
                        >
                            shop
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/introduce"
                            onClick={() => setOpenSidebar(false)}
                        >
                            introduce
                        </Link>
                    </li>
                </ul>

                <button
                    onClick={() => instagramHandler()}
                    className="absolute bottom-64 text-[2em] text-black"
                >
                    <RxInstagramLogo />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
