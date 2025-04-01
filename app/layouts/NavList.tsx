"use client";

import { NavListProps } from "../types/interfaces";

const NavList = ({menuText}: NavListProps) => {
    return (
        <li>
            {/* NavList */}
            <button className="block py-2 px-3 p-0 c_md:p-4 text-gray-900 rounded-sm dark:text-white dark:hover:text-white md:dark:hover:bg-transparent">
                {menuText}
            </button>
        </li>
    )
}

export default NavList;