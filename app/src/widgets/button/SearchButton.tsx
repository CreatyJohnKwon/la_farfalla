"use client";

import { Product } from "@src/entities/type/products";
import { useState, useCallback, useRef } from "react";

interface SearchFloatingButtonProps {
    products: Product[];
    onSearch: (query: string, filteredProducts: Product[]) => void;
}

const SearchButton = ({
    products,
    onSearch,
}: SearchFloatingButtonProps) => {
    // 상태 관리
    const [searchQuery, setSearchQuery] = useState<string>("");

    // refs
    const searchInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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

                // 카테고리 매칭
                if (
                    product.categories.includes(normalizedQuery)
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

    // Mobile: keydown 처리
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault(); 

            // 원하는 '확인' 동작 (여기서는 키보드 닫기)
            if (searchInputRef.current) {
                searchInputRef.current.blur(); // input 포커스를 해제하여 키보드를 닫습니다.
            }
        }
    };

    // 검색어 변경 핸들러
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        performRealTimeSearch(value);
    };

    // 검색 초기화
    const clearSearch = () => {
        setSearchQuery("");
        onSearch("", products);
        searchInputRef.current?.focus();
    };

    return (
        <div
            ref={containerRef}
            className="z-10"
        >
            <div className="flex items-center space-x-2 w-full">
                {/* 돋보기 아이콘 */}
                <svg
                    className="flex-shrink-0 h-6 w-6 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>

                {/* 입력 필드 */}
                <div className="border-b border-gray-400 md:text-base text-sm bg-transparent text-gray-800 font-pretendard font-[300]">
                    <input
                        ref={searchInputRef}
                        type="search"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        className="flex-grow outline-none w-[14vh]
                                    [&::-webkit-search-cancel-button]:appearance-none 
                                    [&::-webkit-search-cancel-button]:hidden"
                    />
                </div>

                {/* 클리어 버튼 */}
                {searchQuery && (
                    <button
                        onClick={clearSearch}
                        className="flex-shrink-0 p-1 ps-0"
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
    );
};

export default SearchButton;