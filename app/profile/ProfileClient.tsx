"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Chillguy from "../../public/chill.png";

const ProfileClient = () => {
    const { data: session } = useSession();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b">
            <div className="flex w-[90%] max-w-lg flex-col items-center justify-center rounded-2xl bg-white p-10 c_base:shadow-lg">
                <h1 className="font-brand mb-16 text-7xl">Profile</h1>
                <h1 className="mb-8 font-mono text-4xl text-gray-800 md:text-5xl">
                    {session?.user?.name || "Guest"}
                </h1>
                <div className="relative mb-6 overflow-hidden rounded-full shadow-lg shadow-slate-600">
                    <Image
                        src={session?.user?.image || Chillguy}
                        width={150}
                        height={150}
                        alt="user profile"
                        className="h-36 w-36 object-cover"
                    />
                </div>
                <span className="mb-6 text-lg text-gray-600 md:text-xl">
                    {session?.user?.email || ""}
                </span>
                <button
                    className="rounded-lg bg-gray-300 px-6 py-3 text-2xl font-thin text-black shadow-md transition-all duration-300 hover:bg-red-600"
                    onClick={() => signOut({ callbackUrl: "/" })}
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default ProfileClient;
