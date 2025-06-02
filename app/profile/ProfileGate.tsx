"use client";

import Image from "next/image";
import FolderImage from "../../public/images/folder_ic.png";

import { profileNavData } from "@src/entities/models/db/menuDatas";

import { useRouter } from "next/navigation";

const ProfileGate = () => {
    const router = useRouter();

    return (
        <div className="flex h-screen w-auto flex-col items-center justify-center">
            <div className="mx-auto grid max-w-[90vw] grid-cols-2 place-items-center md:gap-x-36">
                {profileNavData.map((item) => (
                    <div
                        key={item.id}
                        className="group relative h-full w-full cursor-pointer overflow-hidden sm:w-[20vw]"
                        onClick={() =>
                            router.push(`/profile/${item.id.toLowerCase()}`)
                        }
                    >
                        <div className="flex h-full w-full items-center justify-center">
                            <Image
                                src={FolderImage}
                                alt={`profile_folder_img_${item.id.toLowerCase()}`}
                                width={500}
                                height={500}
                                className="h-full w-full object-cover transition group-hover:brightness-75"
                            />
                            <span className="font-amstel absolute text-[clamp(1rem,1.8vw,2rem)] font-semibold text-white drop-shadow">
                                {item.id}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileGate;
