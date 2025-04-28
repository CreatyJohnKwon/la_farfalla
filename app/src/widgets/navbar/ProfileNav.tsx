"use client";

import { profileNavData } from "@/src/entities/db/menuDatas";
import useProfile from "@/src/shared/hooks/useProfile";

const ProfileNavbar = () => {
    const { setPages } = useProfile();

    return (
        <nav className="h-full w-full bg-white ps-4 transition-all duration-300 ease-in-out col-span-2">
            <div className="w-full font-brand flex items-center justify-between p-0 transition-all duration-300 ease-in-out sm:p-4 sm:text-base c_md:text-xl">
                <ul className="flex flex-col rounded-lg border-gray-100 transition-all duration-300 ease-in-out ms-4 mt-10">
                    {profileNavData.map((navList, index) => (
                        <div key={`navList-${index}`}>
                            <li className="z-50 text-black p-5">
                                <button onClick={() => setPages(navList.link)}>{navList.text}</button>
                            </li>
                        </div>
                    ))}
                </ul>
            </div>
        </nav>
    );
};

export default ProfileNavbar;
