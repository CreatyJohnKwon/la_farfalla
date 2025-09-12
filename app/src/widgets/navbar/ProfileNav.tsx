"use client";

import { profileNavData } from "@src/entities/models/db/menuDatas";
import { redirect } from "next/navigation";

const ProfileNavbar = ({ id }: { id: string }) => {
    return (
        <nav className="absolute top-12 h-full w-full items-center sm:items-start transition-all duration-300 ease-in-out sm:static sm:top-20 sm:col-span-2 flex flex-col">
            <div className="font-amstel flex w-[90vw] flex-row justify-between sm:justify-evenly pt-[4vh] text-sm transition-all duration-300 ease-in-out sm:flex-col sm:ps-8 sm:pt-36 sm:text-base md:ps-10 md:text-xl">
                {profileNavData.map((navList, index) => (
                    <div
                        key={`profile_nav_${index}`}
                        className="p-0 sm:p-5"
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
