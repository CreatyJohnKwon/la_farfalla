"use client";

import { profileNavData } from "@/src/entities/db/menuDatas";
import usePage from "@/src/shared/hooks/usePage";

const ProfileNavbar = () => {
    const { pages, setPages } = usePage();

    return (
        <nav className="fixed left-7 top-32 col-span-1 hidden h-full w-full transition-all duration-300 ease-in-out sm:static sm:top-20 sm:block sm:h-full">
            <div className="font-brand w-full text-sm transition-all duration-300 ease-in-out sm:ps-16 sm:pt-40 sm:text-xl">
                {profileNavData.map((navList, index) => (
                    <div
                        key={`profile_nav_${index}`}
                        className="p-0 sm:pb-5 sm:pt-5"
                    >
                        <button
                            className={`z-40 text-black ${navList.link === pages ? "underline decoration-1" : ""}`}
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
