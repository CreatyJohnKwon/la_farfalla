"use client";

import Navbar from "@/src/widgets/Navbar/Navbar";
// import Image from "next/image";
// import Chillguy from "../../public/chill.png";
import Footer from "@/src/widgets/Footer/Footer";
import Link from "next/link";

const Home = () => {
    return (
        <>
            <div className="flex h-screen w-full flex-col items-center justify-center">
                <Navbar />
                <div className="flex h-screen w-screen items-center justify-center">
                    <div className="relative z-50 mb-64 h-full w-auto">
                        {/* <Image
                            src={Chillguy}
                            alt="chill_guy_img"
                            width={500}
                            height={500}
                            className="absolute inset-0 -z-50 place-self-center object-cover blur-md"
                        /> */}

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
        </>
    );
};

export default Home;
