"use client"; // 클라이언트 컴포넌트로 설정

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";

interface Position {
    x: number;
    y: number;
}

const DraggableFloatingButton = () => {
    // 반응형 패딩과 버튼 크기
    const getResponsiveValues = useCallback(() => {
        const isMobile = window.innerWidth < 768;
        return {
            PADDING: isMobile ? 16 : 32,
            BUTTON_SIZE: isMobile ? 48 : 56, // 모바일에서 약간 작게
            ICON_SIZE: isMobile ? 24 : 28,
        };
    }, []);

    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [mounted, setMounted] = useState<boolean>(false);
    const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
    const [responsiveValues, setResponsiveValues] = useState({
        PADDING: 32,
        BUTTON_SIZE: 56,
        ICON_SIZE: 28,
    });
    const buttonRef = useRef<HTMLButtonElement>(null);

    const pathname = usePathname();
    const shouldHideButton = pathname === "/order";

    // 초기 위치 설정 및 반응형 값 업데이트
    const updatePositionAndValues = useCallback(() => {
        const values = getResponsiveValues();
        setResponsiveValues(values);

        // 현재 위치가 설정되어 있다면 경계 내에서 유지
        setPosition((prev) => {
            if (prev.x === 0 && prev.y === 0) {
                // 초기 설정: 우측 하단
                return {
                    x: window.innerWidth - values.BUTTON_SIZE - values.PADDING,
                    y: window.innerHeight - values.BUTTON_SIZE - values.PADDING,
                };
            } else {
                // 기존 위치를 새로운 화면 크기에 맞게 조정
                const maxX =
                    window.innerWidth - values.BUTTON_SIZE - values.PADDING;
                const maxY =
                    window.innerHeight - values.BUTTON_SIZE - values.PADDING;

                return {
                    x: Math.max(values.PADDING, Math.min(prev.x, maxX)),
                    y: Math.max(values.PADDING, Math.min(prev.y, maxY)),
                };
            }
        });
    }, [getResponsiveValues]);

    useEffect(() => {
        setMounted(true);
        updatePositionAndValues();

        // 화면 크기 변경 감지
        const handleResize = () => {
            updatePositionAndValues();
        };

        window.addEventListener("resize", handleResize);
        // 모바일 방향 전환 감지
        window.addEventListener("orientationchange", () => {
            setTimeout(updatePositionAndValues, 100);
        });

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener(
                "orientationchange",
                updatePositionAndValues,
            );
        };
    }, [updatePositionAndValues]);

    // 드래그 시작
    const startDrag = (clientX: number, clientY: number) => {
        setIsDragging(true);
        setDragStart({
            x: clientX - position.x,
            y: clientY - position.y,
        });
    };

    // 위치 업데이트
    const updatePosition = (clientX: number, clientY: number) => {
        if (!isDragging) return;

        const newX = clientX - dragStart.x;
        const newY = clientY - dragStart.y;

        const maxX =
            window.innerWidth -
            responsiveValues.BUTTON_SIZE -
            responsiveValues.PADDING;
        const maxY =
            window.innerHeight -
            responsiveValues.BUTTON_SIZE -
            responsiveValues.PADDING;

        setPosition({
            x: Math.max(responsiveValues.PADDING, Math.min(newX, maxX)),
            y: Math.max(responsiveValues.PADDING, Math.min(newY, maxY)),
        });
    };

    // 드래그 종료
    const endDrag = () => {
        if (!isDragging) return;
        setIsDragging(false);

        // 모바일에서는 좌/우 스냅을 더 적극적으로
        const screenWidth = window.innerWidth;
        const centerX = position.x + responsiveValues.BUTTON_SIZE / 2;
        const isMobile = screenWidth < 768;

        if (isMobile) {
            // 모바일: 중앙 기준으로 좌/우 스냅
            setPosition((prev) => ({
                ...prev,
                x:
                    centerX < screenWidth / 2
                        ? responsiveValues.PADDING
                        : screenWidth -
                          responsiveValues.BUTTON_SIZE -
                          responsiveValues.PADDING,
            }));
        } else {
            // 데스크톱: 기존 로직 유지
            setPosition((prev) => ({
                ...prev,
                x:
                    centerX < screenWidth / 2
                        ? responsiveValues.PADDING
                        : screenWidth -
                          responsiveValues.BUTTON_SIZE -
                          responsiveValues.PADDING,
            }));
        }
    };

    // 마우스 이벤트
    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        startDrag(e.clientX, e.clientY);
    };

    const handleMouseMove = (e: MouseEvent) => {
        updatePosition(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
        endDrag();
    };

    // 터치 이벤트 (모바일 최적화)
    const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const touch = e.touches[0];
        startDrag(touch.clientX, touch.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const touch = e.touches[0];
        updatePosition(touch.clientX, touch.clientY);
    };

    const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        endDrag();
    };

    // 드래그 중 이벤트 리스너 관리
    useEffect(() => {
        if (isDragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            document.addEventListener("touchmove", handleTouchMove, {
                passive: false,
            });
            document.addEventListener("touchend", handleTouchEnd);

            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
                document.removeEventListener("touchmove", handleTouchMove);
                document.removeEventListener("touchend", handleTouchEnd);
            };
        }
    }, [isDragging, dragStart, position]);

    // 클릭 이벤트 (드래그가 아닐 때만)
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (isDragging) {
            e.preventDefault();
            return;
        }

        alert("아직 플러스 친구가 연동되지 않았습니다.");
    };

    if (!mounted || shouldHideButton) return null;

    return (
        <button
            ref={buttonRef}
            className={`fixed z-50 flex select-none items-center justify-center rounded-full bg-[#FEE500] shadow-lg transition-all duration-200 hover:bg-[#FEE500]/70 hover:shadow-xl ${
                isDragging ? "scale-110 cursor-grabbing" : "cursor-grab"
            } ${
                // 반응형 크기 클래스
                responsiveValues.BUTTON_SIZE === 48 ? "h-12 w-12" : "h-14 w-14"
            }`}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transition: isDragging ? "none" : "all 0.3s ease-out",
                // 모바일에서 터치 영역 확장
                minHeight:
                    responsiveValues.BUTTON_SIZE === 48 ? "44px" : "56px",
                minWidth: responsiveValues.BUTTON_SIZE === 48 ? "44px" : "56px",
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onClick={handleClick}
            // 접근성 개선
            aria-label="플러스 친구 채팅"
            role="button"
        >
            {/* 카카오톡 스타일 채팅 + 플러스 아이콘 */}
            <svg
                width={responsiveValues.ICON_SIZE}
                height={responsiveValues.ICON_SIZE}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-black"
            >
                {/* 채팅 말풍선 */}
                <path
                    d="M12 2C6.48 2 2 5.58 2 10c0 2.5 1.37 4.75 3.5 6.25L4 20l4.5-2c1.13.31 2.32.5 3.5.5 5.52 0 10-3.58 10-8S17.52 2 12 2z"
                    fill="currentColor"
                />
                {/* 플러스 원 */}
                <circle
                    cx="18"
                    cy="6"
                    r={responsiveValues.ICON_SIZE === 24 ? "4" : "5"}
                    fill="#000000"
                    stroke="#FEE500"
                    strokeWidth="1.5"
                />
                {/* 플러스 기호 */}
                <path
                    d={
                        responsiveValues.ICON_SIZE === 24
                            ? "M16.5 6h3M18 4.5v3"
                            : "M16 6h4M18 4v4"
                    }
                    stroke="#FEE500"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        </button>
    );
};

export default DraggableFloatingButton;
