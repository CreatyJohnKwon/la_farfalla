"use client";

import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import DefaultImg from "../../../../public/images/chill.png";

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
            className="group relative flex-1 overflow-hidden transition-all duration-500 ease-in-out hover:flex-[2] aspect-[3/4]"
        >
            <div className="flex flex-col w-full h-full bg-transparent">
                <div className="relative flex-1 overflow-hidden">
                    <Image
                        src={imageUrl || DefaultImg}
                        alt={altText}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500"
                        priority
                    />
                </div>

                <span className="text-sm md:text-base font-amstel text-black p-3">{title}</span>
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