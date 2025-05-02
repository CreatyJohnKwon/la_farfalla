import Image from "next/image";
import Chillguy from "../../public/chill.png";
import { useSession } from "next-auth/react";
import useUsers from "@/src/shared/hooks/useUsers";
import LoginButton from "@/src/components/button/LoginButton";

const ProfileInfo = () => {
    const { data: session } = useSession();
    const { logoutHandler } = useUsers();

    return (
        <div className="grid grid-cols-6 h-full w-full items-center justify-center font-brand">
            <div className="flex flex-row col-span-4 h-full w-full items-center justify-center">
                <div className="relative sm:me-10 overflow-hidden rounded-full">
                    <Image
                        src={session?.user?.image || Chillguy}
                        width={150}
                        height={150}
                        alt="user profile"
                        className="h-36 w-36 object-cover"
                    />
                </div>
                <div className="flex flex-col h-1/4 justify-between items-start">
                    <span className="font-brand font-light text-3xl text-gray-800 md:text-4xl">
                        {`${session?.user?.name || "Guest"}\t님`}
                    </span>
                    <span className="font-brand font-light sm:text-2xl">
                        누적 구매금액: <span className="font-brand">KRW </span>
                    </span>
                    <span className="text-lg text-gray-600 sm:text-2xl">
                        {session?.user?.email || "이메일 정보 없음"}
                    </span>
                </div>
                <div className="flex ms-10 font-brand font-light h-1/4 w-auto">
                    <LoginButton
                        btnTitle="로그아웃"
                        btnStyle={`w-full bg-black/80 hover:bg-black/50 text-white transition-colors text-base font-semibold sm:col-span-2`}
                        btnDisabled={false}
                        btnType="submit"
                        btnFunc={logoutHandler}
                    />
                </div>
                <div className="ms-32 border-l border-gray-300 h-1/3" />
            </div>
            <div className="flex flex-col col-span-2 h-full w-full items-start justify-center text-5xl">
                <span className="font-brand-thin">회의 필요</span>
                <span className="text-lg text-gray-600 md:text-2xl">
                    {`name: ${session?.user?.name || "이름 없음"}`}
                </span>
                <span className="text-lg text-gray-600 md:text-2xl">
                {`email: ${session?.user?.email || "이메일 없음"}`}
                </span>
            </div>
        </div>
    );
};

export default ProfileInfo;
