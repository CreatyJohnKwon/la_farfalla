"use client";

import { profileNavData } from "@/src/entities/models/db/menuDatas";
import { redirect } from "next/navigation";

const ProfileNavbar = ({ id }: { id: string }) => {
    return (
        <nav className="absolute col-span-2 mt-[10vh] h-full w-full transition-all duration-300 ease-in-out sm:static sm:top-20 sm:m-0 sm:h-full">
            <div className="font-amstel fixed w-full pt-[2vh] text-sm transition-all duration-300 ease-in-out sm:ps-10 sm:pt-40 sm:text-xl">
                {profileNavData.map((navList, index) => (
                    <div
                        key={`profile_nav_${index}`}
                        className="p-5 ps-6 pt-2 sm:ps-5 sm:pt-5"
                    >
                        <button
                            className={`z-40 text-black ${navList.id.toLowerCase() === id ? "underline decoration-1" : ""}`}
                            onClick={() => redirect(navList.id.toLowerCase())}
                        >
                            {navList.id}
                        </button>
                    </div>
                ))}
            </div>
        </nav>
    );
};

export default ProfileNavbar;
