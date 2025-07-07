"use client";

import { useEffect } from "react";
import Image from "next/image";
import BackgroundImg from "../../public/images/background_img.jpeg";

const Home = () => {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div className="flex min-h-screen w-full flex-col text-white">
            <div className="absolute inset-0 -z-10">
                <Image
                    src={BackgroundImg}
                    alt="background"
                    height={1080}
                    width={1920}
                    className="h-full w-full object-cover object-[70%_center] sm:object-left"
                />
            </div>
        </div>
    );
};

export default Home;
