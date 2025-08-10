"use client";

import { useMemo, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import useProduct from "@/src/shared/hooks/useProduct";
import ProductsList from "@/src/components/product/ProductsList";
import ProductListSkeleton from "@/src/components/product/ProductListSkeleton";
import SearchFloatingButton from "@/src/widgets/button/SearchFloatingButton";

const Shop = () => {
    const router = useRouter();
    const {
        products,
        productsLoading,
        filteredProducts,
        section,
        isFetchingNextPage,
        handleProductListScroll,
    } = useProduct();

    // 검색바에 전달할 상품 데이터 준비 (평면화된 배열)
    const searchableProducts = useMemo(() => {
        // filteredProducts가 이미 Product[] 형태라면 그대로 사용
        if (Array.isArray(filteredProducts)) {
            return filteredProducts;
        }

        // products가 InfiniteQueryResult 형태라면 평면화
        if (products && typeof products === "object" && "pages" in products) {
            return (
                products.pages?.flatMap((page: any) => page.data || page) || []
            );
        }

        // 기본값
        return [];
    }, [products, filteredProducts]);

    // 검색 관련 상태
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchFilteredProducts, setSearchFilteredProducts] = useState<any[]>(
        [],
    );
    const [isSearchMode, setIsSearchMode] = useState<boolean>(false);

    // 이미지 프리로드 함수
    const preloadImages = useCallback(() => {
        const productsToPreload = isSearchMode
            ? searchFilteredProducts.slice(0, 3)
            : filteredProducts.slice(0, 3);

        if (productsToPreload.length > 0) {
            productsToPreload.forEach((item) => {
                if (item.image?.[0]) {
                    const img = new window.Image();
                    img.src = item.image[0];
                    // R2 최적화 파라미터 추가
                    if (item.image[0].includes("r2.dev")) {
                        const url = new URL(item.image[0]);
                        url.searchParams.set("width", "500");
                        url.searchParams.set("quality", "80");
                        url.searchParams.set("format", "webp");
                        img.src = url.toString();
                    }
                }
            });
        }
    }, [isSearchMode, searchFilteredProducts, filteredProducts]);

    // 실시간 검색 처리 함수
    const handleRealTimeSearch = useCallback(
        (query: string, filteredProducts: any[]) => {
            setSearchQuery(query);
            setSearchFilteredProducts(filteredProducts);
            setIsSearchMode(query.length > 0);

            // 검색 분석을 위한 로깅 (선택사항)
            if (query.length > 0) {
                console.log(
                    `검색어: "${query}", 결과: ${filteredProducts.length}개`,
                );
            }
        },
        [],
    );

    // 컴포넌트 마운트 시 이미지 프리로드
    useMemo(() => {
        if (
            !productsLoading &&
            (filteredProducts.length > 0 || searchFilteredProducts.length > 0)
        ) {
            // 다음 프레임에서 프리로드 실행
            requestAnimationFrame(() => {
                setTimeout(preloadImages, 100);
            });
        }
    }, [
        productsLoading,
        filteredProducts,
        searchFilteredProducts,
        preloadImages,
    ]);

    // 표시할 상품 목록 결정
    const displayProducts = isSearchMode
        ? searchFilteredProducts
        : filteredProducts;
    const isEmptyResults =
        isSearchMode && searchQuery && searchFilteredProducts.length === 0;

    if (productsLoading) {
        return (
            <div className="mb-10 h-screen w-screen">
                <main className="flex h-full w-full flex-col items-center justify-center">
                    <ul className="grid w-[90vw] grid-cols-2 gap-2 sm:gap-3 md:mt-32 md:w-[85vw] md:grid-cols-3">
                        <ProductListSkeleton />
                    </ul>
                </main>
            </div>
        );
    }

    if (
        !searchableProducts ||
        (filteredProducts.length === 0 && !isSearchMode)
    ) {
        return (
            <div className="mb-10 h-screen w-screen">
                {/* 검색 플로팅 버튼 */}
                <SearchFloatingButton
                    products={searchableProducts}
                    onSearch={handleRealTimeSearch}
                />

                <main className="flex h-full w-full flex-col items-center justify-center">
                    <div className="text-center">
                        <p className="text-lg text-gray-600">
                            상품이 없습니다.
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="mb-10 h-screen w-screen">
            {/* 검색 플로팅 버튼 */}
            <SearchFloatingButton
                products={searchableProducts}
                onSearch={handleRealTimeSearch}
            />

            <main className="flex h-full w-full flex-col items-center">
                <div
                    className="h-full w-full overflow-y-auto"
                    onScroll={handleProductListScroll}
                >
                    <div className="flex min-h-full items-center justify-center">
                        {/* 검색 결과 없음 메시지 */}
                        {isEmptyResults ? (
                            <div className="mt-32 text-center">
                                <div className="mb-6">
                                    <svg
                                        className="mx-auto h-16 w-16 text-gray-300"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-medium text-gray-900">
                                    검색 결과가 없습니다
                                </h3>
                                <p className="mb-4 text-gray-500">
                                    '{searchQuery}'에 대한 상품을 찾을 수
                                    없습니다.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* 검색 모드일 때 결과 헤더 */}
                                {isSearchMode && (
                                    <div className="absolute left-1/2 top-20 z-40 -translate-x-1/2 transform">
                                        <div className="rounded-lg border border-gray-200 bg-white px-4 py-2 shadow-sm">
                                            <span className="text-sm text-gray-600">
                                                '{searchQuery}' 검색 결과:{" "}
                                                <strong>
                                                    {
                                                        searchFilteredProducts.length
                                                    }
                                                    개
                                                </strong>
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* 상품 그리드 */}
                                <ul className="mt-24 grid w-[90vw] animate-fade-in grid-cols-2 gap-2 sm:gap-3 md:mt-32 md:w-[85vw] md:grid-cols-3">
                                    {displayProducts.map((item, index) => (
                                        <ProductsList
                                            key={`${item._id}-${isSearchMode ? "search" : section}-${index}`}
                                            product={item}
                                            index={index}
                                        />
                                    ))}

                                    {/* 스켈레톤 - 검색 모드가 아닐 때만 표시 */}
                                    {!isSearchMode && isFetchingNextPage && (
                                        <ProductListSkeleton />
                                    )}
                                </ul>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Shop;
