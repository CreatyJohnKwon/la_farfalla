"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Chillguy from "@/public/chill.png";

const Profile = () => {
    const { data: session } = useSession();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b">
            <div className="flex flex-col justify-center items-center bg-white c_base:shadow-lg rounded-2xl p-10 w-[90%] max-w-lg">
                <h1 className="text-7xl font-brand mb-16">Profile</h1>
                <h1 className="text-4xl md:text-5xl font-mono text-gray-800 mb-8">
                    {session?.user?.name || "Guest"}
                </h1>
                <div className="relative rounded-full overflow-hidden shadow-lg shadow-slate-600 mb-6">
                    <Image 
                        src={session?.user?.image || Chillguy}
                        width={150}
                        height={150}
                        alt="user profile"
                        className="w-36 h-36 object-cover"
                    />
                </div>
                <span className="text-lg md:text-xl text-gray-600 mb-6">
                    {session?.user?.email || ""}
                </span>
                <button
                    className="px-6 py-3 bg-gray-300 text-black font-thin text-2xl rounded-lg shadow-md hover:bg-red-600 transition-all duration-300"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Profile;