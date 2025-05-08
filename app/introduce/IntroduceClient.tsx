"use client";

import ShopDrop from "@/src/widgets/drop/ShopDrop";
import Footer from "@/src/widgets/footer/Footer";
import Navbar from "@/src/widgets/navbar/Navbar";

const IntroduceClient = () => {
    return (
        <div className="flex h-screen w-full flex-col">
            <Navbar children={<ShopDrop />} />
            <main className="flex h-full w-full flex-col items-center justify-center p-5 text-center">
                <div className="-mt-16 space-y-3 font-pretendard text-[0.5em] tracking-tightest transition-all duration-300 ease-in-out sm:text-[1.25em]">
                    <p>사이의 여유, 선택의 아름다움</p>
                    <br/>
                    <p>복잡한 기준과 정해진 취향 속에서 선택의 폭이 좁을수록 더 선명해지는 취향을 이야기합니다</p>
                    <p>흘러가는 유행이 아닌 나를 중심에 두는 옷</p>
                    <p>쉽게 흘려보내기엔 아쉬운 디테일, 그리고 담백한 해방감</p>
                    <br/>
                    <p>La farfalla는 디자인부터 제조까지 자체 제작 시스템을 통해 브랜드가 지향하는 기준을 온전히 담아냅니다</p>
                    <p>단조로운 선택에 지친 이들이 더 자신다운 선택을 할 수 있길 바라는 마음으로..</p>
                </div>
                <br/>
                <span className="font-abhaya sm:font-brand text-[0.5em] sm:text-base">© 2025. lafarfalla. All rights reserved</span>
                <span className="absolute left-10 bottom-0 sm:-bottom-16 font-brand text-[6em] sm:text-[12.3em] transition-all duration-300 ease-in-out text-[#FAF6EB]">
                    introduce
                </span>
            </main>
            <Footer />
        </div>
    );
};

export default IntroduceClient;
