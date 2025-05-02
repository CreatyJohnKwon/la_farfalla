"use client";

import { profileNavData } from "@/src/entities/db/menuDatas";
import usePage from "@/src/shared/hooks/usePage";
import Link from "next/link";

const ProfileNavbar = () => {
    const { pages, setPages } = usePage();

    return (
        <nav className="h-[90vh] w-full bg-transparent transition-all duration-300 ease-in-out col-span-1">
            <div className="w-full font-brand  flex items-center justify-between p-0 transition-all duration-300 ease-in-out c_xl:p-4 text-base sm:text-lg c_xl:text-xl">
                <div className="flex flex-col rounded-lg border-gray-100 transition-all duration-300 ease-in-out sm:m-10">
                    {profileNavData.map((navList, index) => (
                        <div key={`profile_nav_${index}`} className="p-5">
                            <button className={`z-50 text-black ${navList.link === pages ? "underline decoration-1" : ""}`} onClick={() => setPages(navList.link)}>{navList.text}</button>
                        </div>
                    ))}
                </div>
            </div>
        </nav>
    );
};

export default ProfileNavbar;
