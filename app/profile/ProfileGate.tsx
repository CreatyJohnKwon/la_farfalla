"use client";

import FolderImage from "../../public/images/folder_ic.png";
import DefaultImage from "../../public/images/chill.png";
import { profileNavData } from "@/src/entities/models/db/menuDatas";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUserQuery } from "@/src/shared/hooks/react-query/useUserQuery";

const ProfileGate = () => {
    const { data: user, isLoading } = useUserQuery();
    const router = useRouter();

    return (
        <div className="flex h-screen w-auto flex-col items-center justify-center">
            <div className="mx-auto grid max-w-[90vw] place-items-center md:gap-x-36 grid-cols-2">
                {profileNavData.map((item) => (
                    <div
                        key={item.id}
                        className="group relative h-full cursor-pointer overflow-hidden md:w-[20vw]"
                    >
                        <div className="flex h-full w-full items-center justify-center">
                            <Image
                                src={FolderImage}
                                alt={`profile_folder_img_${item.id.toLowerCase()}`}
                                width={500}
                                height={500}
                                className="h-full w-full object-cover transition group-hover:brightness-75"
                                onClick={() =>
                                    router.push(
                                        `/profile/${item.id.toLowerCase()}`,
                                    )
                                }
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
