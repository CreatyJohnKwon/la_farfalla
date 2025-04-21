"use client";

import { NavListProps } from "@/src/entities/type/interfaces";
import Link from "next/link";

const NavList = ({ menuText }: NavListProps) => {
    return (
        <li>
            {/* NavList */}
            <Link
                href={`/${menuText}`}
                className="z-50 block rounded-sm p-0 px-3 py-2 text-gray-900 c_md:p-4"
            >
                {menuText}
            </Link>
        </li>
    );
};

export default NavList;
