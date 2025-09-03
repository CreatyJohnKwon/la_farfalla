"use client";

import Link from "next/link";
import Image, { StaticImageData } from "next/image";

const ProjectLink = ({ 
    href,
    title, 
    imageUrl, 
    altText 
}: {
    href: string;
    title: string;
    imageUrl: string | StaticImageData;
    altText: string;
}) => {
   return (
        <Link
            className="group relative flex-1 h-full w-full md:w-1/2 overflow-hidden transition-all duration-500 ease-in-out md:hover:flex-[2vw]"
            href={href}
        >
            {/* 배경 이미지 */}
            <Image
                src={imageUrl}
                alt={altText}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* 호버 시 나타나는 오버레이 */}
            <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/50"></div>

            {/* 텍스트 컨테이너 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                <span className="text-3xl text-white font-amstel font-[600] z-10 transition-transform duration-500 hidden group-hover:block">
                    {title}
                </span>
            </div>
        </Link>
    );
};

export default ProjectLink;