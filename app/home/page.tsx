"use client";

import Navbar from "@/app/utils/layouts/Navbar/Navbar";
import Image from "next/image";
import Chillguy from "@/public/chill.png"
import Link from "next/link";

const Home = () => {
    return (
        <>
            <div className="flex flex-col min-h-screen w-full justify-center items-center">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-screen w-screen overflow-hidden">
                    <div className="relative w-auto h-1/2 -mt-72">
                        <Image
                            src={Chillguy}
                            alt="chill_guy_img"
                            width={500}
                            height={500}
                            className="absolute inset-0 -z-50 blur-md object-cover place-self-center"
                        />

                        <div className="text-center text-black text-4xl c_base:text-6xl c_md:text-9xl transition-all duration-300 ease-in-out">
                            <Link href="/menu">
                                <p className="font-sans">La farfalla</p>
                            </Link>
                        </div>
                    </div>
                </div>
                <span className="mb-2 text-sm text-white hover:text-gray-900 transition-all duration-700 ease-in-out">Dev by CreatyJohnKwon</span>
            </div>
        </>
    );
}

export default Home;