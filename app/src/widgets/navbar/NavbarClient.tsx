"use client";

import { HiOutlineShoppingBag } from "react-icons/hi2";
import { RxHamburgerMenu } from "react-icons/rx";
import { AiOutlineUser } from "react-icons/ai";

import { useEffect } from "react";
import Link from "next/link";
import Cart from "@src/features/cart/Cart";
import usePage from "@src/shared/hooks/usePage";
import DropdownMenu from "../drop/DropdownMenu";
import useUsers from "@src/shared/hooks/useUsers";

const NavbarClient = () => {
    const {
        session,
        setCartView,
        cartView,
        setOpenSidebar,
        setTextColor,
        menuData,
        menuTitle,
        textColor,
        pathName,
        navStartData,
        shopMenuItems,
    } = usePage();

    const { logoutHandler } = useUsers();

    useEffect(() => {
        switch (pathName) { 
            case "/home":
                setTextColor("text-white");
                break;
            default:
                setTextColor("text-black");
                break;
        }
    }, [pathName]);

    return (
        <nav
            className={`fixed top-0 z-40 h-auto w-full ps-0 pt-4 pb-3 sm:pb-0 text-base shadow-none ${pathName === "/home" ? "bg-transparent" : "bg-white"} ${textColor}`}
        >
            <div
                className={`max-w-screen-w_max relative mx-auto flex items-center justify-between p-0 sm:p-4 text-xl md:text-2xl c_xl:text-3xl`}
            >
                {/* 왼쪽 메뉴 : PC */}
                <ul className="hidden border-gray-100 ps-4 sm:flex sm:space-x-8">
                    <li
                        className="font-amstel block ps-4 sm:ps-6"
                        key={"shop-menu"}
                    >
                        {/* children 상태 대신 DropdownMenu를 직접 렌더링합니다. */}
                        <DropdownMenu
                            title="shop"
                            items={shopMenuItems}
                            triggerType="hover"
                        />
                    </li>
                    <li
                        className="block ps-4 sm:ps-6"
                        key={"about-admin-menu"}
                    >
                        <DropdownMenu
                            title={menuTitle}
                            items={menuData}
                            triggerType="hover"
                        />
                    </li>
                </ul>

                {/* 왼쪽 메뉴 : Mobile */}
                <button onClick={() => setOpenSidebar(true)}>
                    <RxHamburgerMenu
                        className={`ms-6 block text-2xl sm:hidden`}
                    />
                </button>

                {/* 가운데 중앙 로고 (절대 위치) */}
                <div className="font-amstel absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/3 sm:-translate-y-1/2 text-base sm:text-xl md:text-3xl c_xl:text-4xl">
                    <Link href="/home">La farfalla</Link>
                </div>

                <div
                    className={`font-amstel me-2 ml-auto justify-center bg-transparent sm:order-1 sm:me-4`}
                >
                    {/* 오른쪽 메뉴 : Mobile */}
                    <ul className="flex space-x-2 sm:hidden">
                        <button onClick={() => setCartView(true)}>
                            <HiOutlineShoppingBag
                                className={`me-4 text-2xl ${session ? "block" : "hidden"}`}
                            />
                        </button>

                        <Link href={session ? "/profile" : "/login"}>
                            <AiOutlineUser
                                className={`text-2xl ${session ? "me-4" : "me-2"}`}
                            />
                        </Link>
                    </ul>

                    {/* 오른쪽 메뉴 : PC */}
                    <ul className="hidden sm:flex sm:space-x-8">
                        {navStartData.map((navList, index) =>
                            navList.text === "cart" ? (
                                session && (
                                    <li key={`nav_list_${index}`}>
                                        <button
                                            className="block pe-4 sm:pe-6"
                                            onClick={() =>
                                                setCartView(true)
                                            }
                                        >
                                            cart
                                        </button>
                                    </li>
                                )
                            ) : navList.text === "logout" ? (
                                <li key={`nav_list_${index}`}>
                                    <button
                                        onClick={logoutHandler}
                                        className="block pe-4 sm:pe-6"
                                    >
                                        {navList.text}
                                    </button>
                                </li>
                            ) : (
                                <li key={`nav_list_${index}`}>
                                    <Link
                                        href={navList.text === "login" && session ? "/profile" : `/${navList.text}`}
                                        className="block pe-4 sm:pe-6"
                                    >
                                        {navList.text === "login" && session ? "profile" : navList.text}
                                    </Link>
                                </li>
                            ),
                        )}
                    </ul>
                </div>
            </div>
            {cartView && <Cart />}
        </nav>
    );
};

export default NavbarClient;

