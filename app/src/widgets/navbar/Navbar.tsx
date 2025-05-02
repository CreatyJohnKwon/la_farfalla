"use client";

import Link from "next/link";
import { NavbarProps } from "../../entities/type/interfaces";
import useUsers from "@/src/shared/hooks/useUsers";
import SectionDrop from "@/src/components/drop/SectionDrop";

const Navbar = ({ textColor }: NavbarProps) => {
    const { navStartData } = useUsers();

    return (
        <nav className="sticky top-0 z-50 h-full w-full bg-transparent pt-5 ps-0 shadow-none transition-all duration-300 ease-in-out sm:ps-4">
            <div className={`relative max-w-screen-w_max font-brand mx-auto flex items-center justify-between p-0 transition-all duration-300 ease-in-out sm:p-4 sm:text-lg c_md:text-2xl ${textColor}`}>
                {/* 왼쪽 메뉴 */}
                <div className="flex transition-all duration-300 ease-in-out sm:space-x-8">
                    <SectionDrop title="shop" />
                    {/* <Link href="/shop" className="flex items-center ps-6">
                        
                    </Link> */}
                    <Link href="/introduce" className="flex items-center ps-3 sm:ps-6">
                        about
                    </Link>
                </div>

                {/* 가운데 중앙 로고 (절대 위치) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Link
                        href="/home"
                        className="font-brand transition-all duration-300 ease-in-out text-xl sm:text-2xl c_md:text-4xl"
                    >
                        La farfalla
                    </Link>
                </div>

                {/* 오른쪽 메뉴 */}
                <div className={`ml-auto flex justify-center bg-transparent transition-all duration-300 ease-in-out sm:order-1 sm:me-4 ${textColor}`}>
                    <ul className="flex border-gray-100 transition-all duration-300 ease-in-out sm:space-x-8">
                        {navStartData.map((navList, index) => (
                            <Link
                                key={`nav_list_${index}`}
                                href={`/${navList.text}`}
                                className="block pe-4 sm:pe-6"
                            >
                                {navList.text}
                            </Link>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
