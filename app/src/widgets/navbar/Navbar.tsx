"use client";

import NavList from "./NavList";
import { navData } from "@/src/entities/db/menuDatas";
import Link from "next/link";
import { NavbarProps } from "../../entities/type/interfaces";
import useUsers from "@/src/shared/hooks/useUsers";

const Navbar = ({ children }: NavbarProps) => {
    const { sessionCheck } = useUsers();
    sessionCheck(navData);

    return (
        <nav className="sticky top-0 z-50 h-full w-full bg-white p-4 ps-0 shadow-none transition-all duration-300 ease-in-out sm:ps-4">
            <div className="max-w-screen-w_max font-brand mx-auto flex w-full items-center justify-between p-0 transition-all duration-300 ease-in-out sm:p-4 sm:text-lg c_md:text-2xl">
                {/* children 추가 */}
                <div>{children}</div>

                {/* 네비게이션 바 로고 */}
                <button>
                    <Link
                        href="/menu"
                        className="flex items-center space-x-3 ps-6 transition-all duration-300 ease-in-out sm:ps-8 rtl:space-x-reverse"
                    >
                        menu
                    </Link>
                </button>

                {/* 메뉴 */}
                <div className="ml-auto flex justify-center bg-transparent transition-all duration-300 ease-in-out sm:order-1 sm:me-4">
                    <ul className="hover_effect flex rounded-lg border-gray-100 transition-all duration-300 ease-in-out sm:mt-0 sm:space-x-8 sm:dark:bg-transparent rtl:space-x-reverse">
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
