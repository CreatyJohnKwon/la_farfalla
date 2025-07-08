"use client";

import { useState, useEffect, useRef, Ref } from "react";
import ProductInfo from "../../src/components/product/ProductInfo";
import Slider from "@/src/components/product/Slider";
import { useProductQuery } from "@/src/shared/hooks/react-query/useProductQuery";
import { useIntersectionObserver } from "@/src/shared/hooks/useIntersectionObserver";
import DescriptionImage from "@/src/components/product/DescriptionImage";
import ReviewSystem from "@/src/components/review/ReviewSystem";

const ProductClient = ({ id }: { id: string }) => {
    const {
        data: product,
        isLoading: productLoading,
        error,
    } = useProductQuery(id);
    const [visibleImages, setVisibleImages] = useState<Set<number>>(
        new Set([0, 1]),
    ); // 처음 2개는 기본으로 보이게
    const [needsToggle, setNeedsToggle] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);

    // 콘텐츠 높이 체크 함수
    const checkContentHeight = () => {
        if (descriptionRef.current) {
            const contentHeight = descriptionRef.current.scrollHeight;
            setNeedsToggle(contentHeight > 500);
        }
    };

    // Description 섹션 Intersection Observer
    const { ref: descriptionSectionRef, isVisible: isDescriptionVisible } =
        useIntersectionObserver({
            threshold: 0.1,
            rootMargin: "100px",
        });

    // 이미지 프리로드 (상품 로딩 완료 후)
    useEffect(() => {
        if (product && !productLoading && product.description?.images) {
            // 첫 번째 이미지 즉시 프리로드
            const firstImage = product.description.images[0];
            if (firstImage) {
                const img = new window.Image();
                img.src = firstImage;
            }

            const timer = setTimeout(checkContentHeight, 300);
            return () => clearTimeout(timer);
        }
    }, [product, productLoading]);

    // Description이 보일 때 추가 이미지들 프리로드
    useEffect(() => {
        if (isDescriptionVisible && product?.description?.images) {
            const imagesToPreload = product.description.images.slice(0, 3); // 처음 3개
            imagesToPreload.forEach((src, index) => {
                if (src) {
                    const img = new window.Image();
                    // R2 최적화 적용
                    if (src.includes("r2.dev")) {
                        try {
                            const url = new URL(src);
                            url.searchParams.set("width", "800");
                            url.searchParams.set("quality", "85");
                            url.searchParams.set("format", "webp");
                            img.src = url.toString();
                        } catch {
                            img.src = src;
                        }
                    } else {
                        img.src = src;
                    }

                    img.onload = () => {
                        setVisibleImages((prev) => new Set([...prev, index]));
                    };
                }
            });
        }
    }, [isDescriptionVisible, product?.description?.images]);

    // ID가 없는 경우
    if (!id) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-bold text-red-600">
                        Wrong Access
                    </h2>
                    <p className="text-gray-600">There's no product ID</p>
                </div>
            </div>
        );
    }

    // 에러 발생
    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-bold text-red-600">
                        Error issues
                    </h2>
                    <p className="text-gray-600">{String(error)}</p>
                    <p className="mt-2 text-sm text-gray-500">
                        Product ID: {id}
                    </p>
                </div>
            </div>
        );
    }

    // 로딩 중
    if (productLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-black"></div>
                    <p className="font-amstel text-lg font-[400] text-gray-700">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    // 상품 데이터가 없는 경우
    if (!product) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-bold text-gray-700">
                        There are no matching Products
                    </h2>
                    <p className="text-gray-600">Product ID: {id}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col items-center justify-center overflow-x-hidden">
            <div className="mx-auto mt-16 flex h-full w-full flex-col items-center gap-3 transition-all duration-300 ease-in-out sm:mt-24 md:mt-32 md:w-[90%] md:flex-row md:gap-8 lg:mt-32 lg:w-[70%] lg:gap-16">
                <Slider images={product.image} />
                <ProductInfo product={product} />
            </div>

            {/* description 이미지들 */}
            <div
                ref={descriptionSectionRef as Ref<HTMLDivElement | null>}
                className="mt-[50vh] flex w-full flex-col md:mt-[80vh] md:w-2/5"
            >
                <DescriptionImage
                    product={product}
                    visibleImages={visibleImages}
                    setVisibleImages={setVisibleImages}
                    checkContentHeight={checkContentHeight}
                    descriptionRef={descriptionRef}
                    needsToggle={needsToggle}
                />
            </div>

            <ReviewSystem />
        </div>
    );
};

export default ProductClient;
