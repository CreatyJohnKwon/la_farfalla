"use client";

import { SiNaver } from "react-icons/si";
import { RiKakaoTalkFill } from "react-icons/ri";
import useUsers from "@/src/shared/hooks/useUsers";
import { IoClose } from "react-icons/io5";

const OAuth = () => {
    const { loginHandler, setIsOpenOAuth } = useUsers();

    return (
        <>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
                onClick={() => setIsOpenOAuth(false)}
            >
                <div
                    className="relative flex w-4/6 max-w-md flex-col items-center justify-center gap-5 rounded-2xl bg-white p-8 text-base shadow-xl sm:p-10 sm:text-xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="absolute right-4 top-4 text-2xl text-gray-400 transition hover:text-gray-600"
                        onClick={() => setIsOpenOAuth(false)}
                        type="button"
                    >
                        <IoClose />
                    </button>
                    <h2 className="mb-8 mt-5 text-lg font-semibold text-gray-800 sm:mt-1 sm:text-2xl">
                        SNS로 간편 로그인
                    </h2>
                    <button
                        onClick={() => loginHandler("naver")}
                        className="rounded-md bg-green-500/20 px-6 py-3 text-green-500 transition-all duration-300 hover:bg-green-500/40"
                        type="button"
                    >
                        <div className="flex w-full justify-between">
                            <SiNaver className="me-3 mt-[3px] sm:me-5" />
                            네이버 로그인
                        </div>
                    </button>

                    <button
                        onClick={() => loginHandler("kakao")}
                        className="rounded-md bg-[#FEE500]/40 px-6 py-3 text-[#381E1F] transition-all duration-300 hover:bg-[#FEE500]/70"
                        type="button"
                    >
                        <div className="flex w-full justify-between">
                            <RiKakaoTalkFill className="me-3 mt-[3px] sm:me-5" />
                            카카오 로그인
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
};

export default OAuth;
