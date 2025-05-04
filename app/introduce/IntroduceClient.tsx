"use client";

import ShopDrop from "@/src/components/drop/ShopDrop";
import usePage from "@/src/shared/hooks/usePage";
import Footer from "@/src/widgets/footer/Footer";
import Navbar from "@/src/widgets/navbar/Navbar";
import { RxInstagramLogo } from "react-icons/rx";

const IntroduceClient = () => {
    const { instagramHandler } = usePage();

    return (
        <div className="flex h-screen flex-col">
            <Navbar children={<ShopDrop />} />
            <main className="flex h-full w-full flex-col items-center justify-center p-5 text-center">
                <h1 className="font-brand mb-10 text-[2em] tracking-tightest transition-all duration-300 ease-in-out sm:text-[3em]">
                    Introduce
                </h1>

                <div className="space-y-3 font-pretendard text-[0.75em] tracking-tightest transition-all duration-300 ease-in-out sm:text-[1.25em]">
                    <p>사이의 여유, 선택의 아름다움</p>
                    <p>
                        복잡한 기준과 정해진 취향 속에서, 나만의 방향을 찾고자
                        하는 당신에게.
                    </p>
                    <p>La Farfalla 는 무게 없이 가볍고, 정제된 감각으로</p>
                    <p>
                        선택의 폭이 좁을수록 더 선명해지는 취향을 이야기합니다.
                    </p>
                    <p>우리는 묻지 않습니다. 대신 제안합니다.</p>
                    <p>흘러가는 유행이 아닌, 나를 중심에 두는 옷.</p>
                    <p>
                        쉽게 흘려보내기엔 아쉬운 디테일, 그리고 담백한 해방감.
                    </p>
                    <p>La Farfalla 는</p>
                    <p>단조로운 선택에 지친 이들이</p>
                    <p>조금 더 나은 기준을 발견하길 바랍니다.</p>
                    <p>조용하지만 분명하게.</p>
                    <p>당신의 감각은 이미 충분하니까.</p>
                </div>

                <button
                    className="mt-10 flex h-auto w-auto items-center justify-start hover:opacity-80"
                    onClick={() => instagramHandler()}
                >
                    <RxInstagramLogo className="h-5 w-auto sm:h-7" />
                    <span className="font-brand ms-2 border-black text-[0.75em] font-light hover:border-b sm:text-[1.25em]">
                        @lafarfalla____
                    </span>
                </button>
            </main>
            <Footer />
        </div>
    );
};

export default IntroduceClient;
