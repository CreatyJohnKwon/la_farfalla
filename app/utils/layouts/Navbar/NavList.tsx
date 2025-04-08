"use client";

import { NavListProps } from "@/app/utils/types/interfaces";
import Link from "next/link";

const NavList = ({menuText}: NavListProps) => {
    return (
        <li>
            {/* NavList */}
            <Link href={`/${menuText}`} className="block py-2 px-3 p-0 c_md:p-4 text-gray-900 rounded-sm z-50">
                {menuText}
            </Link>
        </li>
    )
}

export default NavList;