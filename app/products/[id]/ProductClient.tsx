"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import DefaultImage from "../../../public/images/chill.png";
import ProductInfo from "../../src/components/product/ProductInfo";
import Slider from "@/src/widgets/slider/Slider";
import { useProductQuery } from "@/src/shared/hooks/react-query/useProductQuery";
import { useIntersectionObserver } from "@/src/shared/hooks/useIntersectionObserver";
import { useOptimizedImage } from "@/src/shared/hooks/useOptimizedImage";

const ProductClient = ({ id }: { id: string }) => {
    const {
        data: product,
        isLoading: productLoading,
        error,
    } = useProductQuery(id);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [needsToggle, setNeedsToggle] = useState(false);
    const [visibleImages, setVisibleImages] = useState<Set<number>>(
        new Set([0, 1]),
    ); // 처음 2개는 기본으로 보이게
    const descriptionRef = useRef<HTMLDivElement>(null);

    // Description 섹션 Intersection Observer
    const { ref: descriptionSectionRef, isVisible: isDescriptionVisible } =
        useIntersectionObserver({
            threshold: 0.1,
            rootMargin: "100px",
        });

    // 콘텐츠 높이 체크 함수
    const checkContentHeight = () => {
        if (descriptionRef.current) {
            const contentHeight = descriptionRef.current.scrollHeight;
            setNeedsToggle(contentHeight > 500);
        }
    };

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

    // 메모이제이션된 이미지 리스트
    const optimizedDescriptionImages = useMemo(() => {
        if (!product?.description?.images) return [];

        return product.description.images.map((src, index) => ({
            src,
            index,
            shouldLoad: visibleImages.has(index) || index < 2,
            priority: index === 0,
        }));
    }, [product?.description?.images, visibleImages]);

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
                ref={descriptionSectionRef as any}
                className="mt-[30vh] flex w-full flex-col md:mt-[80vh] md:w-2/5"
            >
                <div className="relative w-full">
                    <div
                        ref={descriptionRef}
                        className={`overflow-hidden transition-all duration-500 ease-in-out ${
                            showFullDescription || !needsToggle
                                ? "max-h-none"
                                : "max-h-[500px]"
                        }`}
                    >
                        {optimizedDescriptionImages.length > 0 ? (
                            optimizedDescriptionImages.map(
                                ({ src, index, shouldLoad, priority }) => (
                                    <OptimizedDescriptionImage
                                        key={index}
                                        src={src}
                                        alt={`product_image_${id}_${index}`}
                                        index={index}
                                        shouldLoad={shouldLoad}
                                        priority={priority}
                                        onLoad={() => {
                                            if (index < 3) {
                                                setTimeout(
                                                    checkContentHeight,
                                                    100,
                                                );
                                            }
                                        }}
                                        onVisible={() => {
                                            setVisibleImages(
                                                (prev) =>
                                                    new Set([...prev, index]),
                                            );
                                        }}
                                    />
                                ),
                            )
                        ) : (
                            <Image
                                src={DefaultImage}
                                alt={`product_image_${id}_default`}
                                width={500}
                                height={500}
                                className="h-auto w-full object-cover"
                                priority
                            />
                        )}
                    </div>

                    {/* 그라데이션 오버레이 */}
                    {!showFullDescription && needsToggle && (
                        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
                    )}

                    {/* 더보기/접기 버튼 */}
                    {needsToggle && (
                        <div className="flex justify-center p-4">
                            <button
                                onClick={() =>
                                    setShowFullDescription(!showFullDescription)
                                }
                                className="z-40 flex items-center gap-2 rounded-full bg-transparent px-6 py-3 text-gray-700 transition-all duration-300 hover:bg-gray-200"
                            >
                                <span className="font-medium">
                                    {showFullDescription
                                        ? "더보기 접기"
                                        : "더보기"}
                                </span>
                                <svg
                                    className={`h-4 w-4 transition-transform duration-300 ${
                                        showFullDescription ? "rotate-180" : ""
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 개별 Description 이미지 컴포넌트
const OptimizedDescriptionImage = ({
    src,
    alt,
    index,
    shouldLoad,
    priority,
    onLoad,
    onVisible,
}: {
    src: string;
    alt: string;
    index: number;
    shouldLoad: boolean;
    priority: boolean;
    onLoad: () => void;
    onVisible: () => void;
}) => {
    const {
        ref,
        src: optimizedSrc,
        isLoaded,
        isLoading,
    } = useOptimizedImage({
        src: src || DefaultImage.src,
        fallbackSrc: DefaultImage.src,
        priority,
        quality: priority ? 90 : 80,
        width: 800,
    });

    // 이미지가 뷰포트에 들어올 때 콜백 실행
    const { ref: intersectionRef, isVisible } = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: "200px",
    });

    useEffect(() => {
        if (isVisible && !shouldLoad) {
            onVisible();
        }
    }, [isVisible, shouldLoad, onVisible]);

    // ref 병합
    const combinedRef = (el: HTMLDivElement | null) => {
        if (ref) (ref as any).current = el;
        if (intersectionRef) (intersectionRef as any).current = el;
    };

    return (
        <div ref={combinedRef} className="w-full">
            {/* 스켈레톤 로딩 */}
            {(!isLoaded || isLoading) && shouldLoad && (
                <div className="animate-shimmer aspect-[4/3] w-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]">
                    <div className="flex h-full items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                    </div>
                </div>
            )}

            {/* 이미지 렌더링 */}
            {shouldLoad && (
                <Image
                    src={optimizedSrc}
                    alt={alt}
                    width={800}
                    height={600}
                    className={`h-auto w-full object-cover transition-opacity duration-500 ${
                        isLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    priority={priority}
                    quality={priority ? 90 : 80}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 40vw"
                    onLoad={onLoad}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                />
            )}
        </div>
    );
};

export default ProductClient;
