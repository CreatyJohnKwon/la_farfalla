"use client";

import NavList from "./NavList";

const Navbar = () => {
    const menus = [
        { text: 'account' },
        { text: 'menu' },
    ];

    return (
        // shadow-md
        <nav className="sticky top-0 z-40 bg-white transition-all duration-300 ease-in-out w-full h-full shadow-none">
            <div className="max-w-screen-w_max w-full flex items-center justify-between mx-auto p-4">
                {/* 네비게이션 바 로고 */}
                <a href="http://localhost:3000/" className="flex items-center space-x-3 rtl:space-x-reverse">
                    <span className="self-center hidden c_sm:block c_sm:text-lg c_md:text-2xl whitespace-nowrap dark:text-white font-semibold">
                        home
                    </span>
                </a>

                {/* 메뉴 */}
                <div className="hidden c_md:flex c_md:w-auto c_md:order-1 bg-transparent w-full justify-center ml-auto me-5">
                    <ul className="hover_effect flex font-medium p-4 c_md:p-0 mt-4 border border-gray-100 rounded-lg c_md:space-x-8 rtl:space-x-reverse c_md:flex-row md:mt-0 c_md:border-0 c_md:dark:bg-transparent">
                        {menus.map((menuList, index) => (
                            <NavList
                                key={index}
                                menuText={menuList.text}
                            />
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;