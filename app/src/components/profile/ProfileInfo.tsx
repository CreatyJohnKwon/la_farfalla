import { useUserQuery } from "@src/shared/hooks/react-query/useUserQuery";

const ProfileInfo = () => {
    const { data: user, isLoading } = useUserQuery();

    return (
        <div className="mb-20 sm:mb-0 mt-10 sm:mt-40 h-1/2 w-full sm:h-3/4">
            <div className="w-full h-auto flex flex-col sm:flex-row">
                <section className="flex w-full items-center justify-center">
                    <div className="flex h-full w-full flex-col items-start justify-center gap-8 sm:pb-28">
                        {isLoading ? (
                            <div className="flex flex-col items-start justify-center gap-2 text-center text-lg sm:text-2xl md:text-3xl font-[300] text-black animate-pulse inset-0">
                                {/* 프로필 세부정보 스켈레톤 */}
                                <div className="flex flex-col items-start gap-1 text-center sm:items-start">
                                    <div className="h-4 w-16 sm:h-8 sm:w-32 bg-slate-200 rounded-sm" />
                                    <div className="mt-4 sm:mt-2 h-4 w-48 sm:h-8 sm:w-72 bg-slate-200 rounded-sm" />
                                    <div className="mt-4 sm:mt-1.5 h-4 w-48 sm:h-8 sm:w-60 bg-slate-200 rounded-sm" />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-start justify-center gap-2 text-center text-lg sm:text-xl md:text-2xl font-[300] text-black">
                                {/* 프로필 세부정보 */}
                                <span className="font-pretendard md:font-pretendard">
                                    {`${user?.name || "Guest"} 님`}
                                </span>
                                <span className="font-amstel flex items-center gap-3"> {/* flexbox 추가 및 gap 설정 */}
                                    {user?.email ?? "이메일 정보 없음"}
                                    <div className="sm:mb-1.5 mb-1">
                                        {user?.provider === "naver" ? (
                                            <span className="w-1 h-1 sm:w-2 sm:h-2 bg-[#03C75A] rounded-full inline-block" aria-label="네이버 로그인"></span>
                                        ) : user?.provider === "kakao" ? (
                                            <span className="w-1 h-1 sm:w-2 sm:h-2 bg-[#FEE500] rounded-full inline-block" aria-label="카카오 로그인"></span>
                                        ) : user?.provider === "local" ? (
                                            <span className="w-1 h-1 sm:w-2 sm:h-2 bg-black rounded-full inline-block" aria-label="로컬 계정"></span>
                                        ) : null}
                                    </div>
                                </span>
                                <span className="font-pretendard">
                                    총구매금액:
                                    <span className="font-amstel">
                                        {` ${(user?.reward ?? 0).toLocaleString()} KRW`}
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                <section className="font-amstel hidden w-full flex-col sm:flex text-2xl">
                    {/* 섹션 1 : 마일리지 */}
                    <div className="flex h-full w-full items-start justify-end">
                        {isLoading ? (
                            <div className="flex animate-pulse inset-0 flex-row items-center gap-4">
                                MILEAGE : <div className="h-6 w-16 bg-slate-200 rounded-sm" />
                            </div>
                        ) : (
                            <span>{`MILEAGE : ${(user?.mileage ?? 0).toLocaleString()}`}</span>
                        )}
                    </div>

                    {/* 섹션 2 : 쿠폰 */}
                    <div className="flex h-full w-full items-start justify-end pb-24">
                        {isLoading ? (
                            <div className="flex animate-pulse inset-0 flex-row items-center gap-4">
                                COUPON : <div className="h-6 w-16 bg-slate-200 rounded-sm" />
                            </div>
                        ) : (
                            <span>{`COUPON : ${user?.coupon ?? 0}`}</span>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ProfileInfo;
