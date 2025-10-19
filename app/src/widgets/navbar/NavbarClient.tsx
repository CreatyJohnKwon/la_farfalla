"use client";

import { HiOutlineShoppingBag } from "react-icons/hi2";
import { RxHamburgerMenu } from "react-icons/rx";
import { AiOutlineUser } from "react-icons/ai";

import { useEffect } from "react";
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

    useEffect(() => {
        switch (pathName) { 
            case "/home":
            case "/introduce":
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
                    <li className="font-amstel block" key={"shop-menu"}>
                        <DropdownMenu
                            title="SHOP"
                            items={shopMenuItems}
                            triggerType="hover"
                        />
                    </li>
                    <li className="block ps-6" key={"about-menu"}>
                        <DropdownMenu
                            title={"ABOUT"}
                            items={serviceMenuItems}
                            triggerType="hover"
                        />
                    </li>
                    <li className="block ps-6" key={"admin-menu"}>
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
                <button 
                    onClick={() => setOpenSidebar(true)}
                    // ✅ 접근성 개선: aria-label 추가
                    aria-label="전체 메뉴 열기" 
                >
                    <RxHamburgerMenu
                        // aria-label을 부모 버튼에 이동시키고, 아이콘은 hidden으로 설정
                        aria-hidden="true" 
                        className={`ms-1 block text-[25px] z-40 md:hidden`}
                    />
                </button>

                {/* 가운데 중앙 로고 (절대 위치) */}
                <Link 
                    className="font-amstel absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:-translate-y-1 text-base md:text-2xl"
                    // ✅ 접근성 개선: Link 텍스트 콘텐츠가 "LA FARFALLA"이므로, aria-label은 제거하거나 더 명확하게 변경
                    aria-label="LA FARFALLA 홈 페이지로 이동" 
                    href="/home" 
                >LA FARFALLA</Link>

                <div className={`font-amstel ml-auto justify-center bg-transparent md:order-1`}>
                    
                    {/* 오른쪽 메뉴 : Mobile (✅ 목록 구조 및 접근성 수정) */}
                    <ul className="flex space-x-2 md:hidden">
                        {/* 1. 장바구니 버튼 */}
                        <li> 
                            <button 
                                onClick={() => setCartView(true)}
                                // ✅ 접근성 개선: aria-label 추가
                                aria-label="장바구니 열기"
                            >
                                <HiOutlineShoppingBag
                                    // 아이콘을 시각적 요소로만 처리
                                    aria-hidden="true" 
                                    className={`me-3 text-[25px] ${session ? "block" : "hidden"}`}
                                />
                            </button>
                        </li>

                        {/* 2. 사용자/로그인 버튼 */}
                        <li> 
                            <Link 
                                href={session ? "/profile" : "/login"}
                                // ✅ 접근성 개선: aria-label 추가 (아이콘만 있으므로 필수)
                                aria-label={session ? "프로필 페이지로 이동" : "로그인 페이지로 이동"}
                            >
                                <AiOutlineUser
                                    // 아이콘을 시각적 요소로만 처리
                                    aria-hidden="true"
                                    className={`text-[25px] ${session ? "me-1" : "me-0"}`}
                                />
                            </Link>
                        </li>
                    </ul>

                    {/* 오른쪽 메뉴 : PC */}
                    <ul className="hidden md:flex md:space-x-4">
                        {/* ... (PC 메뉴는 이미 <li>를 사용하고 있으므로 구조는 유지) */}
                        {navStartData.map((navList, index) =>
                            navList.text === "CART" ? (
                                session && (
                                    <li key={`nav_list_${index}`}>
                                        <button
                                            className="block pe-4 md:pe-6"
                                            onClick={() => setCartView(true)}
                                            // ✅ 접근성 개선: CART 텍스트가 있으므로 aria-label은 불필요
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
                                        // ✅ aria-label 제거 (텍스트 콘텐츠가 있으므로)
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