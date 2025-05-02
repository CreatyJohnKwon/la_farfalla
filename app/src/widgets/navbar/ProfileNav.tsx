"use client";

import { profileNavData } from "@/src/entities/db/menuDatas";
import usePage from "@/src/shared/hooks/usePage";
import Link from "next/link";

const ProfileNavbar = () => {
    const { pages, setPages } = usePage();

    return (
        <nav className="fixed left-7 top-20 col-span-1 h-[3em] w-full transition-all duration-300 ease-in-out sm:static sm:h-full">
            <div className="font-brand w-full text-sm transition-all duration-300 ease-in-out sm:ps-16 sm:pt-40 sm:text-xl">
                {profileNavData.map((navList, index) => (
                    <div
                        key={`profile_nav_${index}`}
                        className="p-0 sm:pb-5 sm:pt-5"
                    >
                        <button
                            className={`z-50 text-black ${navList.link === pages ? "underline decoration-1" : ""}`}
                            onClick={() => setPages(navList.link)}
                        >
                            {navList.text}
                        </button>
                    </div>
                ))}
            </div>
        </nav>
    );
};

export default ProfileNavbar;
