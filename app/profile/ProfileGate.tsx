"use client";

import Image from "next/image";
import FolderImage from "../../public/images/folder_img.png";
import { profileNavData } from "@src/entities/models/db/menuDatas";
import { useRouter } from "next/navigation";

const ProfileGate = () => {
    const router = useRouter();

    return (
        <div className="flex h-screen w-auto flex-col items-center justify-center">
            <div className="mx-auto grid max-w-[85vw] grid-cols-2 place-items-center gap-y-10 sm:gap-y-24 gap-x-16 sm:gap-x-52">
                {profileNavData.map((item) => (
                    <div
                        key={item.id}
                        className="group relative h-full w-[28vw] cursor-pointer overflow-hidden sm:w-[12vw]"
                        onClick={() =>
                            router.push(`/profile/${item.id.toLowerCase()}`)
                        }
                    >
                        <div className="flex h-full w-full items-center justify-center flex-col">
                            <div className="relative w-full">
                                <Image
                                    src={FolderImage}
                                    alt={`profile_folder_img_${item.id.toLowerCase()}`}
                                    width={1000}
                                    height={1000}
                                    className="w-full object-cover transition group-hover:brightness-75"
                                />
                                {/* 절대 위치 텍스트 (ID) */}
                                {/* <p className="font-amstel absolute inset-0 flex items-center justify-center text-[clamp(1rem,1.8vw,2rem)] font-semibold text-white drop-shadow">
                                    {item.id}
                                </p> */}

                                <div className="absolute inset-0 flex flex-col items-center justify-center text-black gap-1 mt-5">
                                    <p className="font-amstel text-[clamp(1rem,1.8vw,2rem)] font-semibold drop-shadow">
                                        {item.id}
                                    </p>
                                    <p className="font-pretendard -mt-1 font-[200] text-xs md:text-[clamp(1rem,1.8vw,1rem)] drop-shadow">
                                        {item.title}
                                    </p>
                                </div>
                            </div>

                            {/* 제목 (Image와 딱 붙이기)
                            <span className="font-pretendard-thin block w-full text-center text-lg text-black sm:-mt-14 leading-none">
                                {item.title}
                            </span> */}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileGate;
