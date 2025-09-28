"use client";

import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import chillImg from "../../../../public/images/chill.png";

interface ProjectLinkProps {
    href: string;
    title: string;
    imageUrl: StaticImageData | string;
    altText: string;
}

const ProjectLink = ({ 
    href,
    title, 
    imageUrl, 
    altText 
}: ProjectLinkProps) => {
    return (
        <Link
            href={href}
            className="group relative flex-1 overflow-hidden transition-all duration-500 ease-in-out hover:flex-[2]"
        >
            <Image
                src={imageUrl || chillImg}
                alt={altText}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                // sizes="100vw"
                priority // LCP(Largest Contentful Paint) 최적화
            />
            <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/50"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <span className="z-10 text-3xl font-bold text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    {title}
                </span>
            </div>
        </Link>
    );
};

export default ProjectLink;