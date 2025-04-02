"use client";

import { NavListProps } from "../types/interfaces";
import Link from "next/link";

const NavList = ({menuText, menuLink}: NavListProps) => {
    return (
        <li>
            {/* NavList */}
            <Link href={menuLink} className="block py-2 px-3 p-0 c_md:p-4 text-gray-900 rounded-sm">
                {menuText}
            </Link>
        </li>
    )
}

export default NavList;