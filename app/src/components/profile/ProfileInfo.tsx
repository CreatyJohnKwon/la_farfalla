import useUsers from "@/src/shared/hooks/useUsers";
import CustomButton from "@/src/widgets/button/CustomButton";
import { useUserQuery } from "@/src/shared/hooks/react-query/useUserQuery";

const ProfileInfo = () => {
    const { data: user, isLoading } = useUserQuery();
    const { logoutHandler } = useUsers();

    return (
        <div className="mt-24 h-3/4 w-full flex-col c_md:grid c_md:grid-cols-4">
            <div className="flex h-full w-full items-center justify-center c_md:col-span-2">
                <div className="flex h-full w-full flex-col items-center justify-center gap-8 sm:items-start">
                    {isLoading ? (
                        <div className="flex animate-pulse flex-col gap-4">
                            {/* 프로필 세부정보 스켈레톤 */}
                            <div className="flex flex-col items-start gap-2 text-center">
                                <div className="h-12 w-40 bg-slate-200" />
                                {/* 이름 */}
                                <div className="h-4 w-48 bg-slate-200" />
                                {/* 누적금액 */}
                                <div className="mb-2 mt-2 h-4 w-48 bg-slate-200" />
                                {/* 이메일 */}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* 프로필 세부정보 */}
                            <div className="flex flex-col items-center justify-center gap-2 text-center sm:items-start">
                                <span className="font-pretendard text-2xl text-gray-800 c_md:font-pretendard c_md:text-3xl c_xl:text-4xl">
                                    {`${user?.name || "Guest"} 님`}
                                </span>
                                <span className="font-pretendard text-base c_md:text-xl">
                                    누적 구매금액:
                                    <span className="font-amstel">{` ${user?.reward.toLocaleString()} KRW`}</span>
                                </span>
                                <span className="font-amstel text-sm text-gray-600 c_md:text-lg">
                                    {user?.email || "이메일 정보 없음"}
                                </span>
                            </div>
                        </>
                    )}

                    {/* 로그아웃 버튼 */}
                    <div className="font-amstel mt-4 flex c_md:-mt-4">
                        <CustomButton
                            btnTitle="Logout"
                            btnStyle="w-16 h-16 bg-black hover:bg-black/50 text-white transition-colors text-sm h-full sm:text-base z-10"
                            btnDisabled={false}
                            btnType="submit"
                            btnFunc={logoutHandler}
                        />
                    </div>
                </div>
            </div>

            <div className="font-amstel col-span-2 hidden h-full w-full flex-col items-center justify-center text-[1.5em] sm:flex c_md:text-[2em]">
                {/* 섹션 1 : 마일리지 */}
                <div className="flex h-full w-full items-center justify-end">
                    {isLoading ? (
                        <div className="flex animate-pulse flex-row items-center gap-4">
                            Mileage : <div className="h-6 w-16 bg-slate-200" />
                        </div>
                    ) : (
                        <span>{`Mileage : ${user?.mileage.toLocaleString()}`}</span>
                    )}
                </div>

                {/* 섹션 2 : 쿠폰 */}
                {/* <span className="h-auto w-[50vw] border-b border-gray-200 sm:w-3/4" /> */}
                <div className="flex h-full w-full items-center justify-end">
                    {isLoading ? (
                        <div className="flex animate-pulse flex-row items-center gap-4">
                            Coupon : <div className="h-6 w-16 bg-slate-200" />
                        </div>
                    ) : (
                        <span>{`Coupon : ${user?.coupon}`}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
