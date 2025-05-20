import Image from "next/image";
import Chillguy from "../../../../public/images/chill.png";
import useUsers from "@/src/shared/hooks/useUsers";
import CustomButton from "@/src/widgets/button/CustomButton";
import { useUserQuery } from "@/src/shared/hooks/react-query/useUserQuery";

const ProfileInfo = () => {
    const { data: user, isLoading } = useUserQuery();
    const { logoutHandler } = useUsers();

    return (
        <div className="mt-24 flex h-full w-full flex-col items-center justify-center c_md:grid c_md:grid-cols-4">
            <div className="flex h-full w-full items-center justify-between c_md:col-span-2">
                <div className="flex h-full w-full flex-col items-center justify-center gap-8">
                    {
                        isLoading ? (
                            <div className="flex animate-pulse flex-col items-center gap-4">
                                {/* 프로필 이미지 스켈레톤 */}
                                <div className="relative h-32 w-32 overflow-hidden rounded-full bg-slate-200" />

                                {/* 프로필 텍스트 스켈레톤 */}
                                <div className="mt-4 flex flex-col items-center gap-2 text-center">
                                    <div className="h-6 w-48 rounded bg-slate-200" /> {/* 이름 */}
                                    <div className="h-4 w-40 rounded bg-slate-200" /> {/* 누적금액 */}
                                    <div className="h-4 w-36 rounded bg-slate-200" /> {/* 이메일 */}
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* 프로필 이미지 */}
                                <div className="flex">
                                    <div className="relative h-32 w-32 overflow-hidden rounded-full">
                                        <Image
                                            src={user?.image || Chillguy}
                                            alt="user profile"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                </div>

                                {/* 프로필 세부정보 */}
                                <div className="flex flex-col items-center justify-center gap-2 text-center">
                                    <span className="font-pretendard text-2xl text-gray-800 c_md:font-pretendard c_md:text-3xl c_xl:text-4xl">
                                        {`${user?.name || "Guest"} 님`}
                                    </span>
                                    <span className="font-pretendard text-base c_md:text-xl">
                                        누적 구매금액:
                                        <span className="font-amstel">{` ${user?.reward} KRW`}</span>
                                    </span>
                                    <span className="font-amstel text-sm text-gray-600 c_md:text-lg">
                                        {user?.email || "이메일 정보 없음"}
                                    </span>
                                </div>
                            </>
                        )
                    }
                    
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

            <div className="flex h-full col-span-1 flex-col text-[1.5em] c_md:text-[2em] items-center justify-center font-amstel">
                {/* 섹션 1 : 마일리지 */}
                <div className="flex h-full w-full items-center justify-center">
                    <span>{`Mileage : 0`}</span>
                </div>

                {/* 섹션 2 : 쿠폰 */}
                <span className="hidden h-auto w-3/4 border-b border-gray-400 c_md:block" />
                <div className="flex h-full w-full items-center justify-center">
                    <span>{`Coupon : 0`}</span>
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
