"use client";

import Image from "next/image";
import Chillguy from "@/public/chill.png"
import Link from "next/link";

const MainScreen = () => {
    // const 침착맨유튜브 = () => {
    //     confirm("침며드시겠습니까?") ? window.open("https://www.youtube.com/shorts/iplAx5EK_KU", "침착맨유튜브") : alert("아쉽네요..")
    // }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen overflow-hidden">
            <div className="relative w-1/2 h-1/2 font-serif text-center text-9xl text-black -mt-72">
                <Image
                    src={Chillguy}
                    alt="chill_guy_img"
                    width={500}
                    height={500}
                    className="absolute inset-0 -z-50 blur-md object-cover place-self-center"
                />
                <Link href="/menu">
                    <p>LA_FARFALLA</p>
                    <p>WE ARE CHILL</p>
                </Link>
            </div>
        </div>
    )
}

export default MainScreen;