"use client";

import { SearchFloatingButtonProps } from "@/src/components/product/interface";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";

const SearchFloatingButton: React.FC<SearchFloatingButtonProps> = ({
    products,
    onSearch,
}) => {
    // 반응형 값 계산
    const getResponsiveValues = useCallback(() => {
        const isMobile = window.innerWidth < 768;
        return {
            BUTTON_SIZE: isMobile ? 64 : 70,
            ICON_SIZE: isMobile ? 20 : 22,
            INPUT_WIDTH: isMobile ? "calc(100vw - 100px)" : "320px",
            INPUT_HEIGHT: isMobile ? "48px" : "52px",
        };
    }, []);

    // 상태 관리
    const [mounted, setMounted] = useState<boolean>(false);
    const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [responsiveValues, setResponsiveValues] = useState({
        BUTTON_SIZE: 70,
        ICON_SIZE: 22,
        INPUT_WIDTH: "320px",
        INPUT_HEIGHT: "52px",
    });

    // refs
    const searchInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const pathname = usePathname();
    const shouldShowButton = pathname === "/shop";

    // 실시간 검색 알고리즘
    const performRealTimeSearch = useCallback(
        (query: string) => {
            if (!query.trim()) {
                onSearch("", products); // 빈 검색어면 전체 상품 반환
                return;
            }

            const normalizedQuery = query.toLowerCase().trim();
            const filteredProducts = products.filter((product) => {
                // 제목 매칭
                if (
                    product.title.kr.toLowerCase().includes(normalizedQuery) ||
                    product.title.eg.toLowerCase().includes(normalizedQuery)
                ) {
                    return true;
                }

                // 시즌 매칭
                if (
                    product.seasonName.toLowerCase().includes(normalizedQuery)
                ) {
                    return true;
                }

                // 색상 옵션 매칭
                if (
                    product.options &&
                    product.options.some((option) =>
                        option.colorName
                            .toLowerCase()
                            .includes(normalizedQuery),
                    )
                ) {
                    return true;
                }

                // 설명 매칭
                if (
                    product.description.text
                        .toLowerCase()
                        .includes(normalizedQuery) ||
                    product.description.detail
                        .toLowerCase()
                        .includes(normalizedQuery)
                ) {
                    return true;
                }

                return false;
            });

            onSearch(query, filteredProducts);
        },
        [products, onSearch],
    );

    // 검색어 변경 핸들러
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        performRealTimeSearch(value);
    };

    // 검색 모드 토글
    const toggleSearch = () => {
        if (isSearchOpen) {
            // 검색 모드 닫기
            setIsSearchOpen(false);
            setSearchQuery("");
            onSearch("", products); // 전체 상품 복원
        } else {
            // 검색 모드 열기
            setIsSearchOpen(true);
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    };

    // 검색 초기화
    const clearSearch = () => {
        setSearchQuery("");
        onSearch("", products);
        searchInputRef.current?.focus();
    };

    // 외부 클릭 시 검색창 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                if (isSearchOpen && !searchQuery) {
                    setIsSearchOpen(false);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, [isSearchOpen, searchQuery]);

    // 반응형 값 업데이트
    const updateResponsiveValues = useCallback(() => {
        const values = getResponsiveValues();
        setResponsiveValues(values);
    }, [getResponsiveValues]);

    // 초기화 및 반응형 처리
    useEffect(() => {
        setMounted(true);
        updateResponsiveValues();

        const handleResize = () => {
            updateResponsiveValues();
        };

        window.addEventListener("resize", handleResize);
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

    // 조건부 렌더링
    if (!mounted || !shouldShowButton) return null;

    return (
        <div
            ref={containerRef}
            className="fixed bottom-24 right-5 z-40 flex flex-col items-end"
            style={{ gap: "5px" }}
        >
            {/* 검색 입력창 */}
            {isSearchOpen && (
                <div
                    className="rounded-full border border-gray-200 bg-white bg-opacity-95 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out"
                    style={{
                        width: responsiveValues.INPUT_WIDTH,
                        height: responsiveValues.INPUT_HEIGHT,
                    }}
                >
                    <div className="flex h-full items-center px-4">
                        {/* 검색 아이콘 */}
                        <svg
                            width={responsiveValues.ICON_SIZE}
                            height={responsiveValues.ICON_SIZE}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            className="mr-3 flex-shrink-0 text-gray-400"
                        >
                            <circle cx="11" cy="11" r="8" strokeWidth={2} />
                            <path d="M21 21l-4.35-4.35" strokeWidth={2} />
                        </svg>

                        {/* 검색 입력창 */}
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="상품을 검색해보세요..."
                            className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none md:text-base"
                        />

                        {/* 클리어 버튼 */}
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="ml-2 rounded-full p-1 transition-colors hover:bg-gray-100"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    className="text-gray-400"
                                >
                                    <line
                                        x1="18"
                                        y1="6"
                                        x2="6"
                                        y2="18"
                                        strokeWidth={2}
                                    />
                                    <line
                                        x1="6"
                                        y1="6"
                                        x2="18"
                                        y2="18"
                                        strokeWidth={2}
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* 검색 버튼 */}
            <button
                className="flex cursor-pointer select-none flex-col items-center justify-center rounded-xl bg-gray-800 shadow-lg transition-all duration-200 hover:bg-gray-700 hover:shadow-xl"
                style={{
                    width: `${responsiveValues.BUTTON_SIZE}px`,
                    height: `${responsiveValues.BUTTON_SIZE}px`,
                }}
                onClick={toggleSearch}
                aria-label={isSearchOpen ? "검색 닫기" : "상품 검색하기"}
                role="button"
            >
                {isSearchOpen ? (
                    // X 아이콘 (닫기)
                    <svg
                        width={responsiveValues.ICON_SIZE}
                        height={responsiveValues.ICON_SIZE}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="text-white"
                    >
                        <line x1="18" y1="6" x2="6" y2="18" strokeWidth={2} />
                        <line x1="6" y1="6" x2="18" y2="18" strokeWidth={2} />
                    </svg>
                ) : (
                    // 돋보기 아이콘 (검색)
                    <svg
                        width={responsiveValues.ICON_SIZE}
                        height={responsiveValues.ICON_SIZE}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="text-white"
                    >
                        <circle cx="11" cy="11" r="8" strokeWidth={2} />
                        <path d="M21 21l-4.35-4.35" strokeWidth={2} />
                    </svg>
                )}
            </button>
        </div>
    );
};

export default SearchFloatingButton;
