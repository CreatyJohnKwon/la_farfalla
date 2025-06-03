"use client";

const IntroduceClient = () => {
    return (
        <div className="flex h-screen w-full flex-col overflow-hidden">
            <main className="relative flex h-full w-full flex-col items-center justify-center p-5 text-center">
                <div className="-mt-16 space-y-3 font-pretendard text-xs tracking-tightest transition-all duration-300 ease-in-out sm:text-[1.25em] hidden sm:block">
                    <p>사이의 여유, 선택의 아름다움</p>
                    <br />
                    <p>
                        복잡한 기준과 정해진 취향 속에서 선택의 폭이 좁을수록 더
                        선명해지는 취향을 이야기합니다
                    </p>
                    <p>흘러가는 유행이 아닌 나를 중심에 두는 옷</p>
                    <p>쉽게 흘려보내기엔 아쉬운 디테일, 그리고 담백한 해방감</p>
                    <br />
                    <p>
                        La farfalla는 디자인부터 제조까지 자체 제작 시스템을
                        통해 브랜드가 지향하는 기준을 온전히 담아냅니다
                    </p>
                    <p>
                        단조로운 선택에 지친 이들이 더 자신다운 선택을 할 수
                        있길 바라는 마음으로..
                    </p>
                </div>
                <div className="-mt-16 space-y-3 font-pretendard text-xs tracking-tightest transition-all duration-300 ease-in-out sm:text-[1.25em] block sm:hidden">
                    <p>사이의 여유, 선택의 아름다움</p>
                    <br />
                    <p>
                        복잡한 기준과 정해진 취향 속에서 선택의 폭이 좁을수록
                    </p>
                    <p>더 선명해지는 취향을 이야기합니다</p>
                    <p>흘러가는 유행이 아닌 나를 중심에 두는 옷</p>
                    <p>쉽게 흘려보내기엔 아쉬운 디테일, 그리고 담백한 해방감</p>
                    <br />
                    <p>
                        La farfalla는 디자인부터 제조까지 자체 제작 시스템을
                        통해
                    </p>
                    <p>브랜드가 지향하는 기준을 온전히 담아냅니다</p>
                    <p>
                        단조로운 선택에 지친 이들이 더 자신다운 선택을 할 수
                        있길
                    </p>
                    <p>바라는 마음으로..</p>
                </div>
                <br />
                <span className="font-amstel-thin sm:font-amstel text-[0.5em] sm:text-base">
                    © 2025. lafarfalla. All rights reserved
                </span>
                <span className="font-amstel absolute bottom-0 left-10 text-[6em] text-[#FAF6EB] transition-all duration-300 ease-in-out sm:-bottom-16 sm:text-[12.3em] c_xl:-bottom-32 c_xl:text-[20.2em]">
                    introduce
                </span>
            </main>
        </div>
    );
};

export default IntroduceClient;
