"use client";

import useProduct from "@/src/shared/hooks/useProduct";
import useUsers from "@/src/shared/hooks/useUsers";

import { HiOutlineShoppingBag } from "react-icons/hi2";
import { RxHamburgerMenu } from "react-icons/rx";
import { AiOutlineUser } from "react-icons/ai";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import ShopDrop from "../drop/ShopDrop";
import AboutDrop from "../drop/AboutDrop";
import useCart from "@/src/shared/hooks/useCart";
import Cart from "@/src/features/cart/Cart";

const Navbar = () => {
    const { navStartData, session } = useUsers();
    const { setOpenSidebar } = useProduct();
    const { cartView, setCartView } = useCart();

    const [textColor, setTextColor] = useState<string>("text-white");
    const [children, setChildren] = useState<any>(<ShopDrop />);

    const pathName = usePathname();

    useEffect(() => {
        switch (pathName) {
            case "/home":
                setTextColor("text-white");
                setChildren(<ShopDrop />);
                break;
            default:
                setTextColor("text-black");
                break;
        }
    }, [pathName]);

    return (
        <>
            <nav className="fixed top-0 z-40 h-0 w-full bg-transparent ps-0 pt-5 text-[1em] shadow-none">
                <div
                    className={`font-amstel max-w-screen-w_max relative mx-auto flex items-center justify-between p-0 sm:p-4 sm:text-lg c_md:text-2xl ${textColor}`}
                >
                    {/* 왼쪽 메뉴 : PC */}
                    <ul className="hidden border-gray-100 ps-4 sm:flex sm:space-x-8">
                        <li className="block ps-4 sm:ps-6">{children}</li>
                        <li className="block ps-4 sm:ps-6">
                            <AboutDrop />
                        </li>
                    </ul>

                    {/* 왼쪽 메뉴 : Mobile */}
                    <button onClick={() => setOpenSidebar(true)}>
                        <RxHamburgerMenu
                            className={`${textColor} ms-6 block text-[1.5em] sm:hidden`}
                        />
                    </button>

                    {/* 가운데 중앙 로고 (절대 위치) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[1.25em]">
                        <Link href="/home">La farfalla</Link>
                    </div>

                    <div
                        className={`me-2 ml-auto justify-center bg-transparent sm:order-1 sm:me-4 ${textColor}`}
                    >
                        {/* 오른쪽 메뉴 : Mobile */}
                        <ul className="flex space-x-2 sm:hidden">
                            <button onClick={() => setCartView(true)}>
                                <HiOutlineShoppingBag
                                    className={`${textColor} me-4 text-[1.5em] ${session ? "block" : "hidden"}`}
                                />
                            </button>

                            <Link href={"/profile"}>
                                <AiOutlineUser
                                    className={`${textColor} text-[1.5em] ${session ? "me-4" : "me-2"}`}
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
                                ) : (
                                    <li key={`nav_list_${index}`}>
                                        <Link
                                            href={`/${navList.text}`}
                                            className="block pe-4 sm:pe-6"
                                        >
                                            {navList.text}
                                        </Link>
                                    </li>
                                ),
                            )}
                        </ul>
                    </div>
                </div>
                {cartView && <Cart />}
            </nav>
        </>
    );
};

export default Navbar;
