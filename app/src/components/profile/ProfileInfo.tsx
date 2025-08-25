import useUsers from "@src/shared/hooks/useUsers";
import { useUserQuery } from "@src/shared/hooks/react-query/useUserQuery";

const ProfileInfo = () => {
    const { data: user, isLoading } = useUserQuery();
    const { logoutHandler } = useUsers();

    return (
        <div className="mt-0 h-1/2 w-full flex-col sm:mt-20 sm:h-3/4 md:grid md:grid-cols-4">
            <div className="flex h-full w-full items-center justify-center md:col-span-2">
                <div className="flex h-auto w-full flex-col items-start justify-center gap-8 sm:pb-28">
                    {isLoading ? (
                        <div className="flex animate-pulse flex-col gap-4">
                            {/* 프로필 세부정보 스켈레톤 */}
                            <div className="flex flex-col items-start gap-2 text-center sm:items-start">
                                <div className="mt-2 h-8 w-32 bg-slate-200" />
                                <div className="h-4 w-48 bg-slate-200" />
                                <div className="mt-1.5 h-4 w-48 bg-slate-200" />
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* 프로필 세부정보 */}
                            <div className="flex flex-col items-start justify-center gap-2 text-center">
                                <span className="font-pretendard text-xl font-[300] text-gray-800 sm:text-2xl md:font-pretendard md:text-3xl c_xl:text-4xl">
                                    {`${user?.name || "Guest"} 님`}
                                </span>
                                <span className="font-pretendard text-sm sm:text-base c_xl:text-xl">
                                    누적 구매금액:
                                    <span className="font-amstel">
                                        {` ${(user?.reward ?? 0).toLocaleString()} KRW`}
                                    </span>
                                </span>
                                <span className="font-amstel text-sm text-gray-600 underline sm:text-base c_xl:text-xl flex items-center gap-2"> {/* flexbox 추가 및 gap 설정 */}
                                    {user?.email ?? "이메일 정보 없음"}
                                    <div>
                                        {user?.provider === "naver" ? (
                                            <span className="w-2 h-2 bg-[#03C75A] rounded-full inline-block" aria-label="네이버 로그인"></span>
                                        ) : user?.provider === "kakao" ? (
                                            <span className="w-2 h-2 bg-[#FEE500] rounded-full inline-block" aria-label="카카오 로그인"></span>
                                        ) : user?.provider === "local" ? (
                                            <span className="w-2 h-2 bg-black rounded-full inline-block" aria-label="로컬 계정"></span>
                                        ) : null}
                                    </div>
                                </span>
                            </div>
                        </>
                    )}

                    {/* 로그아웃 버튼 */}
                    <div className="font-amstel -mt-4 flex">
                        <button
                            className="z-10 h-10 w-16 bg-black text-sm text-white transition-colors hover:bg-black/50 sm:h-12 sm:w-20 sm:text-base md:text-lg"
                            disabled={false}
                            type="submit"
                            onClick={logoutHandler}
                        >
                            Logout
                        </button>
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
                        <span>{`Mileage : ${(user?.mileage ?? 0).toLocaleString()}`}</span>
                    )}
                </div>

                {/* 섹션 2 : 쿠폰 */}
                <div className="flex h-full w-full items-center justify-end">
                    {isLoading ? (
                        <div className="flex animate-pulse flex-row items-center gap-4">
                            Coupon : <div className="h-6 w-16 bg-slate-200" />
                        </div>
                    ) : (
                        <span>{`Coupon : ${user?.coupon ?? 0}`}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfileInfo;
