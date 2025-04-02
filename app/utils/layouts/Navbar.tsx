"use client";

import NavList from "./NavList";
import { menus } from "../context/dummys";
import Link from "next/link";

const Navbar = () => {

    return (
        <nav className="sticky top-0 z-40 ps-0 c_base:ps-4 p-4 bg-white transition-all duration-300 ease-in-out w-full h-full shadow-none">
            <div className="max-w-screen-w_max w-full flex items-center p-0 c_base:p-4 justify-between mx-auto font-serif c_base:text-lg c_md:text-3xl">
                {/* 네비게이션 바 로고 */}
                <button>
                    <Link href="/menu" className="flex items-center space-x-3 rtl:space-x-reverse ps-8">
                        menu
                    </Link>
                </button>

                {/* 메뉴 */}
                <div className="flex c_base:order-1 bg-transparent justify-center ml-auto c_base:me-5">
                    <ul className="hover_effect flex p-4 c_base:p-0 border-gray-100 rounded-lg c_base:space-x-8 rtl:space-x-reverse c_base:flex-row c_base:mt-0 c_base:dark:bg-transparent transition-all duration-300 ease-in-out">
                        {menus.map((menuList, index) => (
                            <NavList
                                key={index}
                                menuText={menuList.text}
                                menuLink={menuList.link}
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;