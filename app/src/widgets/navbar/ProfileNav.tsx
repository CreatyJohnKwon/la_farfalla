"use client";

import { profileNavData } from "@/src/entities/models/db/menuDatas";
import { redirect } from "next/navigation";

const ProfileNavbar = ({ id }: { id : string}) => {
    return (
        <nav className="absolute mt-[10vh] col-span-2 h-full w-full transition-all duration-300 ease-in-out sm:static sm:top-20 sm:h-full sm:m-0">
            <div className="font-amstel w-full text-sm transition-all duration-300 ease-in-out sm:ps-10 sm:pt-40 pt-[2vh] sm:text-xl">
                {profileNavData.map((navList, index) => (
                    <div key={`profile_nav_${index}`} className="p-5 sm:pt-5 sm:ps-5 pt-2 ps-6">
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
