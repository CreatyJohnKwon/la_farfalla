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
        setOpenSidebar,
        setTextColor,
        setCartView,
        session,
        cartView,
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
            className={`fixed top-0 z-40 h-auto w-full pt-5 pb-3 sm:pb-4 text-base shadow-none ${pathName === "/home" || pathName === "/introduce" ? "bg-transparent" : "bg-white"} ${textColor}`}
        >
            <div
                className={`max-w-screen-w_max w-[93vw] relative mx-auto flex items-center justify-between sm:pt-4 text-xl sm:text-base`}
            >
                {/* 왼쪽 메뉴 : PC */}
                <ul className="hidden border-gray-100 sm:flex sm:space-x-4">
                    <li
                        className="font-amstel block"
                        key={"shop-menu"}
                    >
                        <DropdownMenu
                            title="SHOP"
                            items={shopMenuItems}
                            triggerType="hover"
                        />
                    </li>
                    <li
                        className="block ps-6"
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
                        className={`ms-2 block text-2xl sm:hidden`}
                    />
                </button>

                {/* 가운데 중앙 로고 (절대 위치) */}
                <div className="font-amstel absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 sm:-translate-y-1 text-base sm:text-2xl">
                    <Link href="/home">LA FARFALLA</Link>
                </div>

                <div
                    className={`font-amstel ml-auto justify-center bg-transparent sm:order-1`}
                >
                    {/* 오른쪽 메뉴 : Mobile */}
                    <ul className="flex space-x-2 sm:hidden">
                        <button onClick={() => setCartView(true)}>
                            <HiOutlineShoppingBag
                                className={`me-3 text-2xl ${session ? "block" : "hidden"}`}
                            />
                        </button>

                        <Link href={session ? "/profile" : "/login"}>
                            <AiOutlineUser
                                className={`text-2xl ${session ? "me-2" : "me-0"}`}
                            />
                        </Link>
                    </ul>

                    {/* 오른쪽 메뉴 : PC */}
                    <ul className="hidden sm:flex sm:space-x-4">
                        {navStartData.map((navList, index) =>
                            navList.text === "CART" ? (
                                session && (
                                    <li key={`nav_list_${index}`}>
                                        <button
                                            className="block pe-4 sm:pe-6"
                                            onClick={() =>
                                                setCartView(true)
                                            }
                                        >
                                            CART
                                        </button>
                                    </li>
                                )
                            ) : navList.text === "LOGOUT" ? (
                                <li key={`nav_list_${index}`}>
                                    <button
                                        onClick={logoutHandler}
                                        className="block pe-4 sm:pe-0"
                                    >
                                        {navList.text}
                                    </button>
                                </li>
                            ) : (
                                <li key={`nav_list_${index}`}>
                                    <Link
                                        href={navList.text === "LOGIN" && session ? "/profile" : `/${navList.text.toLowerCase()}`}
                                        className={`${navList.text === "LOGIN" || navList.text === "LOGOUT" ? "pe-0" : "pe-4 sm:pe-6"} block`}
                                    >
                                        {navList.text === "LOGIN" && session ? "PROFILE" : navList.text}
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

