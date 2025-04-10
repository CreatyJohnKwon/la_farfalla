"use client";

import Navbar from "@/utils/layouts/Navbar/Navbar";
import Image from "next/image";
import Chillguy from "../../public/chill.png";
import Link from "next/link";

const Home = () => {
    return (
        <>
            <div className="flex min-h-screen w-full flex-col items-center justify-center">
                <Navbar />
                <div className="flex min-h-screen w-screen flex-col items-center justify-center overflow-hidden">
                    <div className="relative -mt-72 h-1/2 w-auto">
                        <Image
                            src={Chillguy}
                            alt="chill_guy_img"
                            width={500}
                            height={500}
                            className="absolute inset-0 -z-50 place-self-center object-cover blur-md"
                        />

                        <div className="font-brand text-center text-4xl text-black transition-all duration-300 ease-in-out c_base:text-6xl c_md:text-9xl">
                            <Link href="/menu">La farfalla</Link>
                        </div>
                    </div>
                </div>
                <span className="mb-2 text-sm text-white transition-all duration-700 ease-in-out hover:text-gray-900">
                    Dev by CreatyJohnKwon
                </span>
            </div>
        </>
    );
};

export default Home;
