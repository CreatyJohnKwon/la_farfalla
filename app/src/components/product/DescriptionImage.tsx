"use client";

import DefaultImage from "../../../../public/images/white_background.png";
import { RefObject, useMemo } from "react";
import Image from "next/image";
import OptimizedDescriptionImage from "./OptimizedDescriptionImage";
import { DescriptionItem, Product } from "../../entities/type/products";

const DescriptionImage = ({
    product,
    checkContentHeight,
    descriptionRef,
}: {
    product: Product;
    visibleImages: Set<number>;
    setVisibleImages: React.Dispatch<React.SetStateAction<Set<number>>>;
    checkContentHeight: () => void;
    descriptionRef: RefObject<HTMLDivElement | null>;
    needsToggle: boolean;
}) => {
    const processedDescriptionItems = useMemo(() => {
        if (!product?.description?.items) return [];

        return product.description.items.map((item: DescriptionItem, index: number) => {
            if (item.itemType === 'image') {
                return {
                    type: 'image',
                    src: item.src || '',
                    index,
                    // 첫 번째 이미지만 priority를 적용하는 로직은 유지
                    priority: index === 0,
                };
            } else if (item.itemType === 'break') {
                return {
                    type: 'break',
                    index,
                };
            }
            return null;
        }).filter(Boolean);
        // visibleImages 상태가 필요 없으므로 의존성 배열에서 제거
    }, [product?.description?.items]);
    
    // 이미지가 하나라도 있는지 확인하는 변수
    const hasImages = processedDescriptionItems.some(item => item?.type === 'image');

    return (
        <div className="relative w-full">
            <div
                ref={descriptionRef}
                className={`overflow-hidden transition-all duration-500 ease-in-out`}
            >
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
                                    shouldLoad={true}
                                    priority={item.priority}
                                    onLoad={() => {
                                        // 초기 높이 계산 로직은 유지
                                        if (item.index < 3) {
                                            setTimeout(checkContentHeight, 100);
                                        }
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
