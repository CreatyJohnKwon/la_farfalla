import Image from "next/image";
import Chillguy from "../../public/images/chill.png";
import { useSession } from "next-auth/react";
import useUsers from "@/src/shared/hooks/useUsers";
import LoginButton from "@/src/widgets/button/CustomButton";

const ProfileInfo = () => {
    const { data: session } = useSession();
    const { logoutHandler } = useUsers();

    return (
        <div className="mt-24 flex h-full w-full flex-col items-center justify-center md:grid md:grid-cols-6">
            <div className="flex h-full w-full items-center justify-between md:col-span-3">
                <div className="flex h-full w-full flex-col items-center justify-center gap-4 md:flex-row">
                    {/* 프로필 이미지 */}
                    <div className="flex">
                        <div className="relative h-40 w-40 overflow-hidden rounded-full">
                            <Image
                                src={session?.user?.image || Chillguy}
                                alt="user profile"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* 프로필 텍스트 */}
                    <div className="flex flex-col items-center justify-center gap-2 text-center md:items-start md:text-left">
                        <span className="font-pretendard text-2xl text-gray-800 md:font-pretendard md:text-3xl c_xl:text-4xl">
                            {`${session?.user?.name || "Guest"} 님`}
                        </span>
                        <span className="font-pretendard text-base md:text-xl">
                            누적 구매금액:
                            <span className="font-amstel">{` 0 KRW`}</span>
                        </span>
                        <span className="font-amstel text-sm text-gray-600 md:text-lg">
                            {session?.user?.email || "이메일 정보 없음"}
                        </span>
                    </div>

                    {/* 로그아웃 버튼 */}
                    <div className="font-amstel mt-4 flex md:mt-0">
                        <LoginButton
                            btnTitle="Logout"
                            btnStyle="w-16 h-16 bg-black hover:bg-black/50 text-white transition-colors text-sm h-full sm:text-base"
                            btnDisabled={false}
                            btnType="submit"
                            btnFunc={logoutHandler}
                        />
                    </div>
                </div>
                <span className="hidden h-1/2 w-auto border-l border-slate-400 md:block" />
            </div>
            <div className="col-span-3 flex hidden h-full w-full flex-row md:block">
                <span className="w-full">사용자 세부정보</span>
            </div>
        </div>
    );
};

export default ProfileInfo;
