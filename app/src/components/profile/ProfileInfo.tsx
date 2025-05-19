import Image from "next/image";
import Chillguy from "../../../../public/images/chill.png";
import { useSession } from "next-auth/react";
import useUsers from "@/src/shared/hooks/useUsers";
import CustomButton from "@/src/widgets/button/CustomButton";

const ProfileInfo = () => {
    const { data: session } = useSession();
    const { logoutHandler } = useUsers();

    return (
        <div className="mt-24 flex h-full w-full flex-col items-center justify-center c_md:grid c_md:grid-cols-4">
            <div className="flex h-full w-full items-center justify-between c_md:col-span-2">
                <div className="flex h-full w-full flex-col items-center justify-start gap-8 c_md:flex-row">
                    {/* 프로필 이미지 */}
                    <div className="flex">
                        <div className="relative h-32 w-32 overflow-hidden rounded-full">
                            <Image
                                src={session?.user?.image || Chillguy}
                                alt="user profile"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>

                    {/* 프로필 세부정보 */}
                    <div className="flex flex-col items-center justify-center gap-2 text-center c_md:items-start c_md:text-left">
                        <span className="font-pretendard text-2xl text-gray-800 c_md:font-pretendard c_md:text-3xl c_xl:text-4xl">
                            {`${session?.user?.name || "Guest"} 님`}
                        </span>
                        <span className="font-pretendard text-base c_md:text-xl">
                            누적 구매금액:
                            <span className="font-amstel">{` 0 KRW`}</span>
                        </span>
                        <span className="font-amstel text-sm text-gray-600 c_md:text-lg">
                            {session?.user?.email || "이메일 정보 없음"}
                        </span>
                    </div>

                    {/* 로그아웃 버튼 */}
                    <div className="font-amstel mt-4 flex c_md:mt-0">
                        <CustomButton
                            btnTitle="Logout"
                            btnStyle="w-16 h-16 bg-black hover:bg-black/50 text-white transition-colors text-sm h-full sm:text-base"
                            btnDisabled={false}
                            btnType="submit"
                            btnFunc={logoutHandler}
                        />
                    </div>
                </div>
            </div>

            {/* 섹션 1 : 마일리지 */}
            <div className="font-amstel flex h-1/4 items-center text-[1.5em] c_md:col-span-1 c_md:text-[2em]">
                <span className="hidden h-full w-auto border-l border-gray-400 c_md:block" />
                <div className="flex h-full w-full items-center justify-center">
                    <span>{`Mileage : 0`}</span>
                </div>
            </div>

            {/* 섹션 2 : 쿠폰 */}
            <div className="font-amstel flex h-1/4 items-center text-[1.5em] c_md:col-span-1 c_md:text-[2em]">
                <span className="hidden h-full w-auto border-l border-gray-400 c_md:block" />
                <div className="flex h-full w-full items-center justify-center">
                    <span>{`Coupon : 0`}</span>
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
