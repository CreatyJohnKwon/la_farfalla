import Image from "next/image";
import Chillguy from "../../public/images/chill.png";
import { useSession } from "next-auth/react";
import useUsers from "@/src/shared/hooks/useUsers";
import LoginButton from "@/src/widgets/button/LoginButton";

const ProfileInfo = () => {
    const { data: session } = useSession();
    const { logoutHandler } = useUsers();

    return (
        <div className="font-amstel flex h-full w-full grid-cols-2 flex-col items-center justify-center sm:grid-cols-6">
            <div className="col-span-1 flex h-full w-3/5 items-center justify-center sm:col-span-4">
                <div className="font-amstel mt-20 flex w-full flex-col items-center gap-6 sm:mt-0 sm:grid sm:grid-cols-6 sm:items-center sm:justify-center sm:gap-0">
                    {/* 프로필 이미지 */}
                    <div className="flex flex-col items-center justify-center sm:col-span-2 sm:flex sm:items-center">
                        <div className="relative m-5 overflow-hidden rounded-full sm:m-0">
                            <Image
                                src={session?.user?.image || Chillguy}
                                width={150}
                                height={150}
                                alt="user profile"
                                className="h-auto w-auto object-cover"
                            />
                        </div>
                    </div>

                    {/* 프로필 텍스트 */}
                    <div className="flex flex-col items-center justify-center gap-2 text-center sm:col-span-3 sm:items-start sm:text-left">
                        <span className="font-pretendard text-2xl font-light text-gray-800 sm:text-3xl md:text-4xl">
                            {`${session?.user?.name || "Guest"} 님`}
                        </span>
                        <span className="font-pretendard text-base font-light sm:text-xl">
                            누적 구매금액:{" "}
                            <span className="font-amstel">KRW </span>
                        </span>
                        <span className="text-sm text-gray-600 sm:text-lg">
                            {session?.user?.email || "이메일 정보 없음"}
                        </span>
                    </div>

                    {/* 로그아웃 버튼 */}
                    <div className="mt-4 flex items-center justify-center sm:col-span-1 sm:ms-10 sm:mt-0">
                        <LoginButton
                            btnTitle="Logout"
                            btnStyle="aspect-square w-16 h-16 bg-black hover:bg-black/50 text-white transition-colors text-sm sm:w-full sm:text-base"
                            btnDisabled={false}
                            btnType="submit"
                            btnFunc={logoutHandler}
                        />
                    </div>

                    {/* PC에서만 보이는 세로 구분선 */}
                    <div className="hidden h-1/3 border-l border-gray-300 sm:ms-32 sm:block" />
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
