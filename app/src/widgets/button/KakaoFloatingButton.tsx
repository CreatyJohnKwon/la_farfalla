"use client"; // 클라이언트 컴포넌트로 설정

import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

const KakaoFloatingButton = () => {
    // 반응형 패딩과 버튼 크기 (정사각형)
    const getResponsiveValues = useCallback(() => {
        const isMobile = window.innerWidth < 768;
        return {
            BUTTON_SIZE: isMobile ? 64 : 70, // 텍스트를 포함할 수 있는 정사각형 크기
            ICON_SIZE: isMobile ? 20 : 22,
            TEXT_SIZE: "text-xs",
        };
    }, []);

    const [mounted, setMounted] = useState<boolean>(false);
    const [responsiveValues, setResponsiveValues] = useState({
        BUTTON_SIZE: 72,
        ICON_SIZE: 20,
        TEXT_SIZE: "text-sm",
    });

    const pathname = usePathname();
    const shouldHideButton = pathname === "/order";

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
            className="fixed bottom-5 right-5 z-50 flex cursor-pointer select-none flex-col items-center justify-center rounded-xl bg-black shadow-lg transition-all duration-200 hover:shadow-xl sm:hover:bg-gray-800"
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
            <svg
                width={responsiveValues.ICON_SIZE}
                height={responsiveValues.ICON_SIZE}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mb-1 text-[#FEE500]"
            >
                {/* 채팅 말풍선 */}
                <path
                    d="M12 2C6.48 2 2 5.58 2 10c0 2.5 1.37 4.75 3.5 6.25L4 20l4.5-2c1.13.31 2.32.5 3.5.5 5.52 0 10-3.58 10-8S17.52 2 12 2z"
                    fill="currentColor"
                />
                {/* "Ch" 텍스트 */}
                <text
                    x="12"
                    y="11"
                    fontSize={responsiveValues.ICON_SIZE === 20 ? "6" : "7"}
                    fill="#000000"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontWeight="bold"
                    fontFamily="system-ui, -apple-system, sans-serif"
                >
                    Ch
                </text>
            </svg>

            {/* 상담하기 텍스트 */}
            <span
                className={`${responsiveValues.TEXT_SIZE} font-pretendard font-[500] text-[#FEE500]`}
            >
                상담하기
            </span>
        </button>
    );
};

export default KakaoFloatingButton;
