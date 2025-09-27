"use client";

import DefaultImage from "../../../../public/images/chill.png";
import { RefObject, useMemo } from "react";
import Image from "next/image";
import OptimizedDescriptionImage from "./OptimizedDescriptionImage";
import { DescriptionItem, Product } from "../../entities/type/products";

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
    // ✨ 1. 데이터 처리 로직 변경: useMemo 훅을 새로운 items 구조에 맞게 수정
    const processedDescriptionItems = useMemo(() => {
        // product.description.images 대신 product.description.items를 사용
        if (!product?.description?.items) return [];

        return product.description.items.map((item: DescriptionItem, index: number) => {
            if (item.itemType === 'image') {
                return {
                    type: 'image',
                    src: item.src || '', // src가 없을 경우를 대비한 fallback
                    index,
                    shouldLoad: visibleImages.has(index) || index < 2, // Lazy loading 로직 유지
                    priority: index === 0, // 첫 번째 이미지만 priority 적용
                };
            } else if (item.itemType === 'break') {
                return {
                    type: 'break',
                    index,
                };
            }
            return null; // 예외 처리
        }).filter(Boolean); // null 값 제거
    }, [product?.description?.items, visibleImages]);
    
    // 이미지가 하나라도 있는지 확인하는 변수
    const hasImages = processedDescriptionItems.some(item => item?.type === 'image');

    return (
        <div className="relative w-full">
            <div
                ref={descriptionRef}
                className={`overflow-hidden transition-all duration-500 ease-in-out`}
            >
                {/* ✨ 2. 조건부 렌더링: item.type에 따라 이미지 또는 줄바꿈 렌더링 */}
                {hasImages ? (
                    processedDescriptionItems.map((item, index: number) => {
                        if (!item) return null;

                        // Case 1: 아이템 타입이 'image'일 경우
                        if (item.type === 'image') {
                            return (
                                <OptimizedDescriptionImage
                                    key={`${item.type}_${index}`}
                                    src={item.src}
                                    alt={`product_image_${product._id}_${item.index}`}
                                    shouldLoad={item.shouldLoad}
                                    priority={item.priority}
                                    onLoad={() => {
                                        if (item.index < 3) {
                                            setTimeout(checkContentHeight, 100);
                                        }
                                    }}
                                    onVisible={() => {
                                        setVisibleImages(
                                            (prev) => new Set([...prev, item.index]),
                                        );
                                    }}
                                />
                            );
                        }
                        
                        // Case 2: 아이템 타입이 'break'일 경우 (줄바꿈)
                        if (item.type === 'break') {
                            return (
                                <div key={`${item.type}_${index}`}>
                                    <br/>
                                </div>
                            );
                        }

                        return null;
                    })
                ) : (
                    // 이미지가 아예 없을 경우 기본 이미지 표시
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
        </div>
    );
};

export default DescriptionImage;
