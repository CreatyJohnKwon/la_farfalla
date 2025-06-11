"use client";

import { HomeClientProps } from "@src/entities/type/interfaces";
import { useEffect } from "react";
import useProduct from "@src/shared/hooks/useProduct";
import Image from "next/image";
// import BackgroundImg from "../../public/images/sample_file.jpeg";
import BackgroundImg from "../../public/images/background_img.jpeg";

const HomeClient = ({ products }: HomeClientProps) => {
    const { setCategory } = useProduct();

    useEffect(() => {
        setCategory(products);
    }, [products]);

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
                    height={1000}
                    width={1000}
                    className="h-full w-full object-cover object-[70%_center] sm:object-left"
                />
            </div>
        </div>
    );
};

export default HomeClient;
