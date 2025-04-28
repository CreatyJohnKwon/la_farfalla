import Image from "next/image";
import Chillguy from "../../public/chill.png";
import { useSession } from "next-auth/react";
import useUsers from "@/src/shared/hooks/useUsers";

const EditProfile = () => {
    const { data: session } = useSession();
    const { logoutHandler } = useUsers();

    return (
        <div className="flex h-full w-full flex-col items-center justify-center">
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
            <div className="flex gap-5">
                <button
                    className="rounded-lg bg-gray-300 px-6 py-3 text-2xl font-thin text-black shadow-md transition-all duration-300 hover:bg-black hover:text-white"
                    // onClick={() => editProfileHandler()}
                >
                    정보 수정
                </button>
                <button
                    className="rounded-lg bg-gray-300 px-6 py-3 text-2xl font-thin text-black shadow-md transition-all duration-300 hover:bg-red-600 hover:text-white"
                    onClick={() => logoutHandler()}
                >
                    로그아웃
                </button>
            </div>
        </div>
    );
};

export default EditProfile;
