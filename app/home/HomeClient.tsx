"use client";

import Navbar from "@/src/widgets/navbar/Navbar";
import Footer from "@/src/widgets/footer/Footer";
import Link from "next/link";
import { HomeClientProps } from "@/src/entities/type/interfaces";
import { useEffect } from "react";
import useSection from "@/src/shared/hooks/useSection";

const HomeClient = ({ products }: HomeClientProps) => {
    const { setCategory } = useSection();

    useEffect(() => {
        setCategory(products);
    }, [products]);

    return (
        <div className="flex min-h-screen w-full flex-col">
            <Navbar />

            <div className="flex flex-grow items-center justify-center">
                <div className="relative z-50 mb-64 flex items-center justify-center">
                    <Link
                        href="/menu"
                        className="font-brand text-center text-6xl leading-none text-black antialiased transition-all duration-300 ease-in-out sm:text-7xl c_md:text-9xl"
                    >
                        La farfalla
                    </Link>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default HomeClient;
