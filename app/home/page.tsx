"use client";

import Navbar from "@/utils/layouts/Navbar/Navbar";
// import Image from "next/image";
// import Chillguy from "../../public/chill.png";
import Link from "next/link";
import Footer from "@/utils/layouts/Footer/Footer";

const Home = () => {
    return (
        <>
            <div className="flex h-screen w-full flex-col items-center justify-center">
                <Navbar />
                <div className="flex h-screen w-screen items-center justify-center">
                    <div className="relative mb-64 h-full w-auto">
                        {/* <Image
                            src={Chillguy}
                            alt="chill_guy_img"
                            width={500}
                            height={500}
                            className="absolute inset-0 -z-50 place-self-center object-cover blur-md"
                        /> */}

                        <div className="font-brand text-center text-5xl text-black transition-all duration-300 ease-in-out c_base:text-7xl c_md:text-9xl">
                            <Link href="/menu">La farfalla</Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
};

export default Home;
