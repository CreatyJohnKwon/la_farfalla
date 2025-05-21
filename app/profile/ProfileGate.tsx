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
            <div className="fixed start-0 top-0 ms-[5vw] mt-[10vh] h-full sm:ms-0">
                <div className="flex flex-col items-center justify-center text-[2em] text-black sm:m-[10vh]">
                    {isLoading ? (
                        <>
                            <div className="flex animate-pulse flex-col items-center gap-4">
                                <div className="h-[14vh] w-[14vh] rounded-full bg-slate-200" />
                                <div className="mt-[3vh] h-4 w-32 bg-slate-200" />
                            </div>
                        </>
                    ) : (
                        <>
                            <Image
                                src={user?.image || DefaultImage}
                                alt="profile_image"
                                width={500}
                                height={500}
                                className="h-[14vh] w-auto rounded-full bg-slate-100 object-cover"
                            />
                            {/* 프로필 이름, 까지만 */}
                            <p className="mt-[3vh] font-pretendard text-[clamp(1rem,1.8vw,2rem)] font-[300] text-black">
                                {`${user?.name} 님`}
                            </p>
                        </>
                    )}
                </div>
            </div>
            <div className="m-0 mx-auto grid max-w-[50vw] grid-rows-2 place-items-center gap-x-36 sm:mt-52 md:m-0 md:grid-cols-2">
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
