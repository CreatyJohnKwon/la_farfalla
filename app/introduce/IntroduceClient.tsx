"use client";

import Footer from "@/src/widgets/Footer/Footer";
import Navbar from "@/src/widgets/Navbar/Navbar";
import { RxInstagramLogo } from "react-icons/rx";

const IntroduceClient = () => {
    const instagramHandler = () =>
        window.open(
            "https://www.instagram.com/lafarfalla____?igsh=aHdsM3EzNzk1bDh5&utm_source=qr",
            "la_farfalla_instagram",
        );

    return (
        <>
            <Navbar />
            <main className="flex h-full flex-col items-center justify-center p-5 text-center">
                <div className="flex min-h-[70vh] flex-col items-center justify-center">
                    <h1 className="font-brand mb-10 text-5xl transition-all duration-300 ease-in-out sm:text-7xl">
                        Introduce
                    </h1>

                    <div className="font-brand-thin max-w-5xl space-y-4 text-lg transition-all duration-300 ease-in-out sm:text-xl c_md:text-3xl">
                        <span className="font-brand-light mt-2">
                            La fafalla{" "}
                        </span>
                        <span>
                            는 미래지향적이고 모던한 감각을 지닌 여성 브랜드로
                        </span>
                        <p className="mt-2">
                            일상적이면서도 세련된 디자인을 통해 현대 여성들의
                            다양한 라이프스타일을 반영합니다
                        </p>
                        <p className="mt-2">
                            이 브랜드는 기능성과 미적 요소를 조화롭게 결합하여
                        </p>
                        <p className="mt-2">
                            착용자에게 편안함과 자신감을 동시에 선사하는 것을
                            목표로 합니다
                        </p>
                    </div>

                    <button
                        className="mt-20 flex h-auto w-auto items-center justify-start hover:opacity-80"
                        onClick={() => instagramHandler()}
                    >
                        <RxInstagramLogo className="h-7 w-auto" />
                        <span className="font-brand-light ms-2 border-black hover:border-b">
                            @lafarfalla____
                        </span>
                    </button>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default IntroduceClient;
