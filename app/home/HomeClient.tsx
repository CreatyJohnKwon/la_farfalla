"use client";

import Navbar from "@/src/widgets/Navbar/Navbar";
import Footer from "@/src/widgets/Footer/Footer";
import Link from "next/link";
import { HomeClientProps } from "@/src/entities/interfaces";
import { useEffect } from "react";
import useSection from "@/src/shared/hooks/useSection";

const HomeClient = ({ shops }: HomeClientProps) => {
    const { setCategory } = useSection();

    useEffect(() => {
        setCategory(shops);
    }, [shops]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center">
            <Navbar />
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="relative z-50 mb-64 h-full w-auto">
                    <Link
                        href="/menu"
                        className="font-brand text-center text-6xl text-black transition-all duration-300 ease-in-out c_base:text-7xl c_md:text-9xl"
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
