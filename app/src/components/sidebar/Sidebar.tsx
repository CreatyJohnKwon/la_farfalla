"use client";

import useSection from "@/src/shared/hooks/useSection";
import useUsers from "@/src/shared/hooks/useUsers";
import Link from "next/link";
import { useEffect, useState } from "react";

import { IoCloseOutline } from "react-icons/io5";
import { RxInstagramLogo } from "react-icons/rx";

const Sidebar = () => {
    const { openSidebar, setOpenSidebar } = useSection();
    const [isVisible, setIsVisible] = useState(false); // 화면에 보이는 여부
    const { session } = useUsers();
    const [animationClass, setAnimationClass] = useState(
        "animate-slide-in-left",
    );

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
        <div className={`fixed inset-0 z-50 bg-white ${animationClass}`}>
            <div className="relative flex h-full w-full flex-col items-center justify-center">
                <button
                    className="absolute left-4 top-4 text-[2em] text-black"
                    onClick={() => setOpenSidebar(false)}
                >
                    <IoCloseOutline />
                </button>

                <Link
                    href={`/${session ? "profile" : "login"}`}
                    onClick={() => setOpenSidebar(false)}
                    className="font-brand absolute right-5 top-5 text-[1.2em] text-black"
                >
                    {session ? "Profile" : "Login"}
                </Link>

                <ul className="font-brand -mt-20 space-y-6 text-center font-pretendard text-[2em] text-black">
                    <li>
                        <Link
                            href="/shop"
                            onClick={() => setOpenSidebar(false)}
                        >
                            Shop
                        </Link>
                    </li>
                    <li>
                        <Link
                            href="/notice"
                            onClick={() => setOpenSidebar(false)}
                        >
                            About
                        </Link>
                    </li>
                </ul>

                <div className="font-brand absolute top-5 text-[1.25em] transition-all duration-300 ease-in-out">
                    <Link href="/home" onClick={() => setOpenSidebar(false)}>
                        La farfalla
                    </Link>
                </div>

                <Link
                    href="/notice"
                    className="absolute bottom-64 text-[2em] text-black"
                >
                    <RxInstagramLogo />
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
