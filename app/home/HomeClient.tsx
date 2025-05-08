"use client";

import Navbar from "@/src/widgets/navbar/Navbar";
import Footer from "@/src/widgets/footer/Footer";
import { HomeClientProps } from "@/src/entities/type/interfaces";
import { useEffect } from "react";
import useSection from "@/src/shared/hooks/useSection";
import Image from "next/image";
import BackgroundImg from "../../public/images/sample_file.jpeg";
import ShopDrop from "@/src/widgets/drop/ShopDrop";

const HomeClient = ({ products }: HomeClientProps) => {
    const { setCategory } = useSection();

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
            <Navbar textColor="text-white" children={<ShopDrop />} />

            <div className="absolute inset-0 -z-10">
                <Image
                    src={BackgroundImg}
                    alt="background"
                    height={1000}
                    width={1000}
                    className="h-full w-full object-cover"
                />
            </div>

            <Footer />
        </div>
    );
};

export default HomeClient;
