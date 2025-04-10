"use client";

import NavList from "./NavList";
import { navData } from "@/utils/context/dummy";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { NavbarProps } from "../../types/interfaces";

const Navbar = ({ children }: NavbarProps) => {
    const { status } = useSession();
    status === "unauthenticated" || status === "loading"
        ? (navData[1].text = "login")
        : (navData[1].text = "profile");

    return (
        <nav className="sticky top-0 z-50 h-full w-full bg-transparent p-4 ps-0 shadow-none transition-all duration-300 ease-in-out c_base:ps-4">
            <div className="max-w-screen-w_max font-brand mx-auto flex w-full items-center justify-between p-0 c_base:p-4 c_base:text-lg c_md:text-2xl">
                {/* children 추가 */}
                {children}

                {/* 네비게이션 바 로고 */}
                <button>
                    <Link
                        href="/menu"
                        className="flex items-center space-x-3 ps-8 rtl:space-x-reverse"
                    >
                        menu
                    </Link>
                </button>

                {/* 메뉴 */}
                <div className="ml-auto flex justify-center bg-transparent c_base:order-1 c_base:me-4">
                    <ul className="hover_effect flex rounded-lg border-gray-100 transition-all duration-300 ease-in-out c_base:mt-0 c_base:flex-row c_base:space-x-8 c_base:dark:bg-transparent rtl:space-x-reverse">
                        {navData.map((navList, index) => (
                            <NavList key={index} menuText={navList.text} />
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
