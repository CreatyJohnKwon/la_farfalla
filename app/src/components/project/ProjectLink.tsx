"use client";

import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import DefaultImg from "../../../../public/images/white_background.png";

interface ProjectLinkProps {
    id: string;
    title: string;
    imageUrl: StaticImageData | string;
    altText: string;
}

const ProjectLink = ({ 
    id,
    title, 
    imageUrl, 
    altText 
}: ProjectLinkProps) => {
    return (
        <Link
            href={`/project/${id}`}
            // 1. 전체 컨테이너의 종횡비(aspect-[3/4])를 제거했습니다.
            className="group relative flex overflow-hidden transition-all duration-500 ease-in-out hover:flex-[2] h-auto"
        >
            <div className="flex flex-col w-full h-full bg-transparent">
                {/* 2. 이미지를 감싸는 div에 aspect-[4/3]를 추가하고, 불필요한 flex-1을 제거했습니다. */}
                <div className="relative w-full overflow-hidden aspect-[3/4]">
                    <Image
                        src={imageUrl || DefaultImg}
                        alt={altText}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500"
                        quality={75}
                        priority
                    />
                </div>

                {/* 제목은 이미지 아래에 자연스럽게 위치합니다. */}
                <span className="text-xs sm:text-sm md:text-base font-amstel text-black pt-3 pb-3">{title}</span>
            </div>

            <div className="hidden md:flex absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/50"></div>
            <div className="hidden md:flex absolute inset-0 flex-col items-center justify-center p-4">
                <span className="z-10 md:text-lg lg:text-2xl xl:text-3xl c_xl:text-4xl font-amstel-bold text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    {title}
                </span>
            </div>
        </Link>
    );
};

export default ProjectLink;