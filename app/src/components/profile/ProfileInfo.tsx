import useUsers from "@/src/shared/hooks/useUsers";
import CustomButton from "@/src/widgets/button/CustomButton";
import { useUserQuery } from "@/src/shared/hooks/react-query/useUserQuery";

const ProfileInfo = () => {
    const { data: user, isLoading } = useUserQuery();
    const { logoutHandler } = useUsers();

    return (
        <div className="h-3/4 w-full flex-col sm:mt-20 md:grid md:grid-cols-4">
            <div className="flex h-full w-full items-center justify-center md:col-span-2">
                <div className="flex h-full w-full flex-col items-center justify-center gap-8 sm:items-start">
                    {isLoading ? (
                        <div className="flex animate-pulse flex-col gap-4">
                            {/* 프로필 세부정보 스켈레톤 */}
                            <div className="flex flex-col items-start gap-2 text-center">
                                <div className="h-12 w-40 bg-slate-200" />
                                <div className="h-4 w-48 bg-slate-200" />
                                <div className="mb-2 mt-2 h-4 w-48 bg-slate-200" />
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* 프로필 세부정보 */}
                            <div className="flex flex-col items-center justify-center gap-2 text-center sm:items-start">
                                <span className="font-pretendard text-2xl text-gray-800 md:font-pretendard md:text-[1.5em] c_xl:text-[1.8em]">
                                    {`${user?.name || "Guest"} 님`}
                                </span>
                                <span className="font-pretendard text-[0.8em] md:text-[1em]">
                                    누적 구매금액:
                                    <span className="font-amstel">{` ${user?.reward.toLocaleString()} KRW`}</span>
                                </span>
                                <span className="font-amstel text-[0.8em] text-gray-600 md:text-[1em]">
                                    {user?.email || "이메일 정보 없음"}
                                </span>
                            </div>
                        </>
                    )}

                    {/* 로그아웃 버튼 */}
                    <div className="font-amstel mt-4 flex md:-mt-4">
                        <CustomButton
                            btnTitle="Logout"
                            btnStyle="w-16 h-16 bg-black hover:bg-black/50 text-white transition-colors text-[0.8em] md:text-[1em] h-full z-10"
                            btnDisabled={false}
                            btnType="submit"
                            btnFunc={logoutHandler}
                        />
                    </div>
                </div>
            </div>

            <div className="font-amstel col-span-2 hidden h-full w-full flex-col items-center justify-center text-[1.5em] sm:flex md:text-[1.5em]">
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
