"use client";

import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
import DefaultImage from "../../../../public/images/chill.png";
import { priceResult, priceDiscount } from "@src/features/calculate";
import { useOptimizedImage } from "@/src/shared/hooks/useOptimizedImage";
import LoadingSpinner from "../../widgets/spinner/LoadingSpinner";
import { ProductsListProps } from "./interface";

const ProductsList = memo<ProductsListProps>(({ product, index = 0 }) => {
    // 최적화된 이미지 훅 사용
    const {
        ref,
        src: optimizedSrc,
        isLoaded,
        isLoading,
        shouldLoad,
    } = useOptimizedImage({
        src: product.image?.[0] || DefaultImage.src,
        fallbackSrc: DefaultImage.src,
        priority: index < 4, // 처음 4개만 우선순위
        quality: index < 4 ? 85 : 75,
        width: 500,
    });

    return (
        <li
            className="group animate-fade-in pb-8 text-center opacity-0 md:pb-10"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <Link href={`/products/${product._id}`} className="block h-full">
                <div
                    ref={ref as any}
                    className="relative overflow-hidden transition-all duration-300 md:group-hover:scale-[1.01]"
                >
                    {/* 3:4 비율 (4/3 * 100% = 133.33%) */}
                    <div className="pb-[133.33%]"></div>

                    {/* 향상된 스켈레톤 로딩 */}
                    {(!isLoaded || isLoading) && shouldLoad && (
                        <div className="absolute left-0 top-0 h-full w-full bg-gray-100">
                            <LoadingSpinner
                                fullScreen={true}
                                size="lg"
                                message="Loading..."
                            />
                        </div>
                    )}

                    {/* 최적화된 이미지 렌더링 */}
                    {shouldLoad && (
                        <Image
                            src={optimizedSrc}
                            alt={product.title.eg || ""}
                            width={500}
                            height={667}
                            className={`absolute left-0 top-0 h-full w-full object-cover transition-all duration-500 ${
                                isLoaded ? "opacity-100" : "opacity-0"
                            }`}
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            priority={index < 2} // 처음 2개만 priority
                            quality={index < 4 ? 85 : 75}
                            loading={index < 4 ? "eager" : "lazy"}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                        />
                    )}

                    {/* 호버 오버레이 */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-10"></div>
                </div>

                {/* 상품 정보 */}
                <div className="pt-2 text-xs transition-all duration-700 ease-in-out sm:text-base">
                    <p className="font-amstel-thin sm:font-amstel text-black transition-colors duration-300 group-hover:text-gray-900">
                        {`[${product.title.eg}]`}
                    </p>
                    <p className="font-pretendard font-medium text-black">
                        {`${product.title.kr}`}
                    </p>
                    {product.options && (
                        <p className="font-amstel-thin sm:font-amstel text-gray-600">
                            {`${product.options.length} colors`}
                        </p>
                    )}
                </div>

                {/* 가격 정보 */}
                <div>
                    {product.quantity === "0" ? (
                        <div className="text-center">
                            <p className="font-amstel-bold text-base text-red-900">
                                SOLD OUT
                            </p>
                        </div>
                    ) : product.discount === "0" || !product.discount ? (
                        <span className="font-amstel-thin sm:font-amstel text-xs font-semibold text-gray-900 sm:text-base">
                            {`KRW ${priceResult(product)}`}
                        </span>
                    ) : (
                        <div className="font-amstel-thin sm:font-amstel -space-y-1">
                            <span className="text-xs text-gray-500 line-through sm:text-base">
                                {`KRW ${priceResult(product)}`}
                            </span>
                            <div className="flex items-center justify-center space-x-2">
                                <span className="py-1 text-xs font-bold text-red-500 px-1 sm:py-1 sm:text-base">
                                    {`${product.discount}%`}
                                </span>
                                <span className="text-xs font-bold text-slate-600 sm:text-base">
                                    {`KRW ${priceDiscount(product)}`}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </Link>
        </li>
    );
});

ProductsList.displayName = "ProductsList";

export default ProductsList;
