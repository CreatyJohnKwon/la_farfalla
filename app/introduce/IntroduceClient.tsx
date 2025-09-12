"use client";

import Image from "next/image";
import imageUrl from "../../public/images/bg_introduce_250911.jpg"
import imageUrlMobile from "../../public/images/bg_introduce_250912_mobile.jpeg"

const IntroduceClient = () => {
    return (
        <div className="flex min-h-screen w-full flex-col overflow-hidden group relative">
            {/* 배경 이미지 */}
            <Image
                src={imageUrl}
                alt={"introduce_pc_bg_img"}
                fill
                className="object-cover transition-transform duration-500 sm:block hidden"
            />
            <Image
                src={imageUrlMobile}
                alt={"introduce_mobile_bg_img"}
                fill
                className="object-cover transition-transform duration-500 sm:hidden block"
            />

            {/* <main className="relative flex h-full w-full flex-col items-center justify-center p-5 text-center bg-white/60">
                <div className="-mt-16 hidden space-y-3 font-pretendard text-[1.25em] tracking-tightest transition-all duration-300 ease-in-out sm:block">
                    <p>사이의 여유, 선택의 아름다움</p>
                    <br />
                    <p>
                        복잡한 기준과 정해진 취향 속에서 선택의 폭이 좁을수록 더
                        선명해지는 취향을 이야기합니다
                    </p>
                    <p>흘러가는 유행이 아닌 나를 중심에 두는 옷</p>
                    <p>쉽게 흘려보내기엔 아쉬운 디테일, 그리고 담백한 해방감</p>
                    <br />
                    <span className="font-amstel">La farfalla </span>는
                    디자인부터 제조까지 자체 제작 시스템을 통해 브랜드가
                    지향하는 기준을 온전히 담아냅니다
                    <p>
                        단조로운 선택에 지친 이들이 더 자신다운 선택을 할 수
                        있길 바라는 마음으로..
                    </p>
                </div>
                <div className="-mt-16 block space-y-3 font-pretendard text-sm tracking-tightest transition-all duration-300 ease-in-out sm:hidden">
                    <p>사이의 여유, 선택의 아름다움</p>
                    <br />
                    <p>복잡한 기준과 정해진 취향 속에서 선택의 폭이 좁을수록</p>
                    <p>더 선명해지는 취향을 이야기합니다</p>
                    <p>흘러가는 유행이 아닌 나를 중심에 두는 옷</p>
                    <p>쉽게 흘려보내기엔 아쉬운 디테일, 그리고 담백한 해방감</p>
                    <br />
                    <span className="font-amstel">La farfalla </span>는
                    디자인부터 제조까지 자체 제작 시스템을 통해
                    <p>브랜드가 지향하는 기준을 온전히 담아냅니다</p>
                    <p>
                        단조로운 선택에 지친 이들이 더 자신다운 선택을 할 수
                        있길
                    </p>
                    <p>바라는 마음으로..</p>
                </div>
                <br />
                <span className="font-amstel-thin sm:font-amstel text-[0.5em] sm:text-base">
                    © 2025. lafarfalla. All rights reserved.
                </span>
                {/* <span className="font-amstel absolute bottom-0 left-10 text-[6em] text-[#FAF6EB]/50 transition-all duration-300 ease-in-out sm:-bottom-16 sm:text-[12.3em] c_xl:-bottom-32 c_xl:text-[20.2em]">
                    introduce
                </span>
            </main> */}
        </div>
    );
};

export default IntroduceClient;
