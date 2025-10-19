"use client";

import { HiOutlineShoppingBag } from "react-icons/hi2";
import { RxHamburgerMenu } from "react-icons/rx";
import { AiOutlineUser } from "react-icons/ai";

import { useEffect, useState } from "react";
import Link from "next/link";
import usePage from "@src/shared/hooks/usePage";
import DropdownMenu from "../drop/DropdownMenu";
import useUsers from "@src/shared/hooks/useUsers";
import Cart from "@/src/widgets/modal/cart/Cart";
import { adminMenuItems, serviceMenuItems } from "@/src/utils/dataUtils";
import { adminEmails } from "../../../../public/data/common";

const NavbarClient = () => {
    const {
        setOpenSidebar,
        setTextColor,
        setCartView,
        session,
        cartView,
        textColor,
        pathName,
        navStartData,
        shopMenuItems,
    } = usePage();
    const { logoutHandler } = useUsers();
    const [isClient, setIsClient] = useState<boolean>(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

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
            className={`fixed top-0 z-40 h-auto w-full pt-5 pb-3 md:pb-4 text-base shadow-none ${pathName === "/home" || pathName === "/introduce" ? "bg-transparent" : "bg-white"} ${textColor}`}
        >
            <div
                className={`max-w-screen-w_max w-[93vw] relative mx-auto flex items-center justify-between md:pt-4 text-xl md:text-base`}
            >
                {/* 왼쪽 메뉴 : PC */}
                <ul className="hidden border-gray-100 md:flex md:space-x-4">
                    <li
                        className="font-amstel block"
                        key={"shop-menu"}
                    >
                        {isClient && <DropdownMenu
                            title="SHOP"
                            items={shopMenuItems}
                            triggerType="hover"
                        />}
                    </li>
                    <li
                        className="block ps-6"
                        key={"about-menu"}
                    >
                        {isClient && <DropdownMenu
                            title={"ABOUT"}
                            items={serviceMenuItems}
                            triggerType="hover"
                        />}
                    </li>
                    <li
                        className="block ps-6"
                        key={"admin-menu"}
                    >
                        {adminEmails.includes(session?.user.email) && 
                            <DropdownMenu
                                title={"ADMIN"}
                                items={adminMenuItems}
                                triggerType="hover"
                            />
                        }
                    </li>
                </ul>

                {/* 왼쪽 메뉴 : Mobile */}
                <button onClick={() => setOpenSidebar(true)}>
                    <RxHamburgerMenu
                        aria-label="btn-sidebar-open"
                        className={`ms-1 block text-[25px] z-40 md:hidden`}
                    />
                </button>

                {/* 가운데 중앙 로고 (절대 위치) */}
                <div className="font-amstel absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:-translate-y-1 text-base md:text-2xl">
                    <Link 
                        aria-label="btn_home"
                        href="/home" 
                    >LA FARFALLA</Link>
                </div>

                <div
                    className={`font-amstel ml-auto justify-center bg-transparent md:order-1`}
                >
                    {/* 오른쪽 메뉴 : Mobile */}
                    <div className="flex space-x-2 md:hidden">
                        <button onClick={() => setCartView(true)}>
                            <HiOutlineShoppingBag
                                aria-label="btn-cart-open"
                                className={`me-3 text-[25px] ${session ? "block" : "hidden"}`}
                            />
                        </button>

                        <Link href={session ? "/profile" : "/login"}>
                            <AiOutlineUser
                                aria-label="btn-profile-or-login"
                                className={`text-[25px] ${session ? "me-1" : "me-0"}`}
                            />
                        </Link>
                    </div>

                    {/* 오른쪽 메뉴 : PC */}
                    <ul className="hidden md:flex md:space-x-4">
                        {navStartData.map((navList, index) =>
                            navList.text === "CART" ? (
                                session && (
                                    <li key={`nav_list_${index}`}>
                                        <button
                                            className="block pe-4 md:pe-6"
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
                                        className="block pe-4 md:pe-0"
                                    >
                                        {navList.text}
                                    </button>
                                </li>
                            ) : (
                                <li key={`nav_list_${index}`}>
                                    <Link
                                        aria-label="btn-user-manage"
                                        href={navList.text === "LOGIN" && session ? "/profile" : `/${navList.text.toLowerCase()}`}
                                        className={`${navList.text === "LOGIN" || navList.text === "LOGOUT" ? "pe-0" : "pe-4"} block`}
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

