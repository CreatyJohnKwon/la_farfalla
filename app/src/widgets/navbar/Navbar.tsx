"use client";

import { NavbarProps } from "../../entities/type/interfaces";
// import AboutDrop from "@/src/components/drop/AboutDrop";
import useSection from "@/src/shared/hooks/useSection";
import useUsers from "@/src/shared/hooks/useUsers";

import { HiOutlineShoppingBag } from "react-icons/hi2";
import { RxHamburgerMenu } from "react-icons/rx";
import { AiOutlineUser } from "react-icons/ai";

import { useRouter } from "next/navigation";
import Link from "next/link";

const Navbar = ({ children, textColor }: NavbarProps) => {
    const { navStartData } = useUsers();
    const { setOpenSidebar } = useSection();
    const router = useRouter();

    return (
        <>
            <nav className="fixed top-0 z-40 h-0 w-full bg-transparent ps-0 pt-5 text-[1em] shadow-none transition-all duration-300 ease-in-out sm:ps-4">
                <div
                    className={`max-w-screen-w_max font-brand relative mx-auto flex items-center justify-between p-0 transition-all duration-300 ease-in-out sm:p-4 sm:text-lg c_md:text-2xl ${textColor}`}
                >
                    {/* 왼쪽 메뉴 : PC */}
                    <ul className="hidden border-gray-100 transition-all duration-300 ease-in-out sm:flex sm:space-x-8">
                        <li className="block ps-4 sm:ps-6">{children}</li>
                        <li className="block ps-4 sm:ps-6">
                            {/* <AboutDrop /> */}
                            <button onClick={() => router.push("/introduce")}>
                                introduce
                            </button>
                        </li>
                    </ul>

                    {/* 왼쪽 메뉴 : Mobile */}
                    <button onClick={() => setOpenSidebar(true)}>
                        <RxHamburgerMenu
                            className={`${textColor} ms-6 block text-[1.5em] sm:hidden`}
                        />
                    </button>

                    {/* 가운데 중앙 로고 (절대 위치) */}
                    <div className="font-brand absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[1.25em]">
                        <Link href="/home">La farfalla</Link>
                    </div>

                    <div
                        className={`me-2 ml-auto justify-center bg-transparent transition-all duration-300 ease-in-out sm:order-1 sm:me-4 ${textColor}`}
                    >
                        {/* 오른쪽 메뉴 : Mobile */}
                        <ul className="flex space-x-2 transition-all duration-300 ease-in-out sm:hidden">
                            <Link href={"/profile"}>
                                <AiOutlineUser
                                    className={`${textColor} me-4 text-[1.5em]`}
                                />
                            </Link>

                            <Link href={"/cart"}>
                                <HiOutlineShoppingBag
                                    className={`${textColor} me-4 text-[1.5em]`}
                                />
                            </Link>
                        </ul>

                        {/* 오른쪽 메뉴 : PC */}
                        <ul className="hidden transition-all duration-300 ease-in-out sm:flex sm:space-x-8">
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
        </>
    );
};

export default Navbar;
