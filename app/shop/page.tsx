"use client";

import { useMemo, useCallback, useEffect } from "react";
import useProduct from "@/src/shared/hooks/useProduct";
import ProductsList from "@/src/components/product/ProductsList";
import ProductListSkeleton from "@/src/components/product/ProductListSkeleton";

const Shop = () => {
    const { 
        products,
        productsLoading,
        filteredProducts,
        section,
        isFetchingNextPage,
        handleProductListScroll
     } = useProduct();

    // 이미지 프리로드 함수
    const preloadImages = useCallback(() => {
        if (filteredProducts.length > 0) {
            // 처음 3개 이미지 프리로드
            filteredProducts.slice(0, 3).forEach((item, index) => {
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
    }, [filteredProducts]);

    // 컴포넌트 마운트 시 이미지 프리로드
    useMemo(() => {
        if (!productsLoading && filteredProducts.length > 0) {
            // 다음 프레임에서 프리로드 실행
            requestAnimationFrame(() => {
                setTimeout(preloadImages, 100);
            });
        }
    }, [productsLoading, filteredProducts, preloadImages]);

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

    if (!products || filteredProducts.length === 0) {
        return (
            <div className="mb-10 h-screen w-screen">
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
            <main className="flex h-full w-full flex-col items-center">
                <div className="h-full w-full overflow-y-auto" onScroll={handleProductListScroll}>
                    <div className="flex min-h-full items-center justify-center">
                        <ul className="mt-24 grid w-[90vw] animate-fade-in grid-cols-2 gap-2 sm:gap-3 md:mt-32 md:w-[85vw] md:grid-cols-3">
                            {filteredProducts.map((item, index) => (
                                <ProductsList
                                    key={`${item._id}-${section}`}
                                    product={item}
                                    index={index}
                                />
                            ))}

                            {/* 스켈레톤 */}
                            {isFetchingNextPage && <ProductListSkeleton />}
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Shop;
