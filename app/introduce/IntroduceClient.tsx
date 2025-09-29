"use client";

import Image from "next/image";
import imageUrl from "../../public/images/bg_introduce_250911.jpg"
import imageUrlMobile from "../../public/images/bg_introduce_250923_mobile.jpeg"

export const revalidate = 3600;

const IntroduceClient = () => {
    return (
        <div className="flex min-h-screen w-full flex-col overflow-hidden group relative">
            {/* 배경 이미지 */}
            <Image
                src={imageUrl}
                alt={"introduce_pc_bg_img"}
                fill
                className="object-cover transition-transform duration-500 sm:block hidden"
                priority
            />
            <Image
                src={imageUrlMobile}
                alt={"introduce_mobile_bg_img"}
                fill
                className="object-cover transition-transform duration-500 sm:hidden block"
                priority
            />

            <div className="absolute inset-0 bg-gradient-to-t from-white from-10% to-transparent to-25%" />
        </div>
    );
};

export default IntroduceClient;
