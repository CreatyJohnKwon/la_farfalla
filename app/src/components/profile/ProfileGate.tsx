"use client";

import FolderImage from "../../../../public/images/folder_ic.png";
import DefaultImage from "../../../../public/images/chill.png";
import { folderData } from "@/src/entities/models/db/menuDatas";

import useUsers from "@/src/shared/hooks/useUsers";

import Image from "next/image";
import ProfileClient from "@/profile/ProfileClient";
import usePage from "@/src/shared/hooks/usePage";

const ProfileGate = () => {
    const { session } = useUsers();
    const { setPages, pages } = usePage();

    if (pages) return <ProfileClient />;

    return (
        <div className="flex h-screen w-auto flex-col items-center justify-center">
            <div className="fixed start-0 top-0 h-full">
                <div className="m-[10vh] flex flex-col items-center justify-center text-[2em] text-black">
                    {/* 프로필 사진 */}
                    <Image
                        src={session?.user?.image || DefaultImage}
                        alt="profile_image"
                        width={500}
                        height={500}
                        className="h-[16vh] w-auto rounded-full bg-slate-100 object-cover"
                    />
                    {/* 프로필 이름, 까지만 */}
                    <p className="mt-[3vh] font-pretendard text-[clamp(1rem,1.8vw,2rem)] font-[300] text-black">
                        {`${session?.user?.name} 님`}
                    </p>
                </div>
            </div>
            <div className="mx-auto grid max-w-[50vw] grid-rows-2 place-items-center gap-x-36 sm:grid-cols-2">
                {folderData.map((item) => (
                    <div
                        key={item.id}
                        className="group relative h-full cursor-pointer overflow-hidden md:w-[24vw]"
                    >
                        <div className="flex h-full w-full items-center justify-center">
                            <Image
                                src={FolderImage}
                                alt={`profile_folder_img_${item.id}`}
                                width={500}
                                height={500}
                                className="h-full w-full object-cover transition group-hover:brightness-75"
                                onClick={() => setPages(item.id)}
                            />
                            <span className="font-amstel absolute text-[clamp(1rem,1.8vw,2rem)] font-semibold text-white drop-shadow">
                                {item.title}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileGate;
