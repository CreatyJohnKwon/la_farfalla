"use client";

import { useMemo, useCallback } from "react";
import useProduct from "@/src/shared/hooks/useProduct";
import { useProductListQuery } from "@/src/shared/hooks/react-query/useProductQuery";
import ProductsList from "@/src/widgets/list/ProductsList";

const Shop = () => {
    const { section } = useProduct();
    const { data: product, isLoading: productsLoading } = useProductListQuery();

    // 필터링된 상품 메모이제이션
    const filteredProducts = useMemo(() => {
        if (!product) return [];

        return product.filter(
            (item) => section === "" || item.seasonName === section,
        );
    }, [product, section]);

    // 이미지 프리로드 함수
    const preloadImages = useCallback(() => {
        if (filteredProducts.length > 0) {
            // 처음 6개 이미지 프리로드
            filteredProducts.slice(0, 6).forEach((item, index) => {
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

    // 로딩 스켈레톤
    const LoadingSkeleton = () => (
        <div className="mb-10 h-screen w-screen">
            <main className="flex h-full w-full flex-col items-center justify-center">
                <ul className="grid w-[90vw] grid-cols-2 gap-2 sm:gap-3 md:mt-32 md:w-[85vw] md:grid-cols-3">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <li key={index} className="pb-8 text-center md:pb-0">
                            <div className="relative overflow-hidden">
                                <div className="pb-[133.33%]"></div>
                                <div className="absolute left-0 top-0 h-full w-full">
                                    <div className="animate-shimmer h-full w-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]"></div>
                                </div>
                            </div>
                            <div className="space-y-2 pt-2">
                                <div className="h-4 animate-pulse rounded bg-gray-200"></div>
                                <div className="mx-auto h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
                                <div className="mx-auto h-3 w-1/2 animate-pulse rounded bg-gray-200"></div>
                                <div className="mx-auto h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
                            </div>
                        </li>
                    ))}
                </ul>
            </main>
        </div>
    );

    if (productsLoading) {
        return <LoadingSkeleton />;
    }

    if (!product || filteredProducts.length === 0) {
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
            <main className="flex h-full w-full flex-col items-center justify-center">
                <ul className="grid w-[90vw] animate-fade-in grid-cols-2 gap-2 overflow-y-auto sm:gap-3 md:mt-32 md:w-[85vw] md:grid-cols-3">
                    {filteredProducts.map((item, index) => (
                        <ProductsList
                            key={`${item._id}-${section}`} // section 변경 시 리렌더링 방지
                            product={item}
                            index={index}
                        />
                    ))}
                </ul>
            </main>
        </div>
    );
};

export default Shop;
