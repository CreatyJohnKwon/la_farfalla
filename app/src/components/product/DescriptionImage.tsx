"use client";

import DefaultImage from "../../../../public/images/chill.png";
import { RefObject, useMemo, useState } from "react";
import Image from "next/image";
import OptimizedDescriptionImage from "./OptimizedDescriptionImage";
import { Product } from "@/src/entities/type/interfaces";

// 개별 Description 이미지 컴포넌트
const DescriptionImage = ({
    product,
    visibleImages,
    setVisibleImages,
    checkContentHeight,
    descriptionRef,
    needsToggle,
}: {
    product: Product;
    visibleImages: Set<number>;
    setVisibleImages: React.Dispatch<React.SetStateAction<Set<number>>>;
    checkContentHeight: () => void;
    descriptionRef: RefObject<HTMLDivElement | null>;
    needsToggle: boolean;
}) => {
    const [showFullDescription, setShowFullDescription] = useState(false);

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

    return (
        <div className="relative w-full">
            <div
                ref={descriptionRef}
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    showFullDescription || !needsToggle
                        ? "max-h-none"
                        : "max-h-[700px]"
                }`}
            >
                {optimizedDescriptionImages.length > 0 ? (
                    optimizedDescriptionImages.map(
                        ({ src, index, shouldLoad, priority }) => (
                            <OptimizedDescriptionImage
                                key={index}
                                src={src}
                                alt={`product_image_${product._id}_${index}`}
                                shouldLoad={shouldLoad}
                                priority={priority}
                                onLoad={() => {
                                    if (index < 3) {
                                        setTimeout(checkContentHeight, 100);
                                    }
                                }}
                                onVisible={() => {
                                    setVisibleImages(
                                        (prev) => new Set([...prev, index]),
                                    );
                                }}
                            />
                        ),
                    )
                ) : (
                    <Image
                        src={DefaultImage}
                        alt={`product_image_${product._id}_default`}
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
                            {showFullDescription ? "더보기 접기" : "더보기"}
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
    );
};

export default DescriptionImage;
