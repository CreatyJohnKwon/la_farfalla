"use client"; // 클라이언트 컴포넌트로 설정

import useCart from "@src/shared/hooks/useCart";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

const KakaoFloatingButton = () => {
    // 반응형 패딩과 버튼 크기 (정사각형)
    const getResponsiveValues = useCallback(() => {
        const isMobile = window.innerWidth < 768;
        return { BUTTON_SIZE: isMobile ? 52 : 70 };
    }, []);

    const [mounted, setMounted] = useState<boolean>(false);
    const [responsiveValues, setResponsiveValues] = useState({
        BUTTON_SIZE: 70,
    });
    const { cartView } = useCart();

    const pathname = usePathname();
    const shouldHideButton = pathname === "/order";
    const visable = !pathname.includes("/admin");

    // 반응형 값 업데이트
    const updateResponsiveValues = useCallback(() => {
        const values = getResponsiveValues();
        setResponsiveValues(values);
    }, [getResponsiveValues]);

    useEffect(() => {
        setMounted(true);
        updateResponsiveValues();

        // 화면 크기 변경 감지
        const handleResize = () => {
            updateResponsiveValues();
        };

        window.addEventListener("resize", handleResize);
        // 모바일 방향 전환 감지
        window.addEventListener("orientationchange", () => {
            setTimeout(updateResponsiveValues, 100);
        });

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener(
                "orientationchange",
                updateResponsiveValues,
            );
        };
    }, [updateResponsiveValues]);

    if (!mounted || shouldHideButton) return null;

    return (
        <button
            className={`group fixed bottom-5 h-6 right-5 flex cursor-pointer select-none flex-row items-center justify-center rounded-[20px] md:rounded-[25px] bg-white/70 transition-all duration-200 shadow-gray-950 shadow-2xl sm:hover:bg-gray-600/50 ${pathname.includes("/home") || cartView === true ? "z-30" : "z-40"} ${visable ? "block" : "hidden"}`}
            style={{
                width: `${responsiveValues.BUTTON_SIZE}px`,
                height: `${responsiveValues.BUTTON_SIZE}px`,
            }}
            onClick={() =>
                window.open("https://pf.kakao.com/_Uxfaxin/chat", "_blank")
            }
            // 접근성 개선
            aria-label="카카오톡 채널 상담하기"
            role="button"
        >
            {/* 카카오톡 채널 아이콘 */}
            {/* <svg
                width={responsiveValues.ICON_SIZE}
                height={responsiveValues.ICON_SIZE}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mb-1 text-[#000000] w-6 h-6"
            >
                <path
                    d="M12 2C6.48 2 2 5.58 2 10c0 4.42 4.48 8 10 8s10-3.58 10-8S17.52 2 12 2z"
                    fill="currentColor"
                />
                <text
                    x="12"
                    y="11"
                    fontSize={responsiveValues.ICON_SIZE === 20 ? "7" : "8"}
                    fill="#FFFFFF"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontWeight="bold"
                    fontFamily="sans-serif"
                >
                    Ch
                </text>
            </svg> */}

            {/* 상담하기 텍스트 */}
            <span className={`text-base md:text-xl font-amstel-bold text-black group-hover:text-white`}>Q</span>
            <span className="text-base md:text-xl font-pretendard-bold text-black group-hover:text-white">&</span>
            <span className={`text-base md:text-xl font-amstel-bold text-black group-hover:text-white`}>A</span>
        </button>
    );
};

export default KakaoFloatingButton;
