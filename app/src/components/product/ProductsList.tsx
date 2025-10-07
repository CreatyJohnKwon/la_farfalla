"use client";

import Link from "next/link";
import Image from "next/image";
import { memo, useState } from "react";
import DefaultImage from "../../../../public/images/chill.png";
import { priceResult, priceDiscount } from "@src/features/calculate";
import { Product } from "../../entities/type/products";
import { returnProductPath } from "@/src/utils/commonAction";

interface ProductsListProps {
    product: Product;
    index?: number;
}

const ProductsList = memo<ProductsListProps>(({ product, index = 0 }) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    return (
        <li
            className={`group pb-10 text-center transition-opacity duration-500 md:pb-16 ${
                isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ transitionDelay: `${index * 50}ms` }}
        >
            <Link
                href={`/products/${returnProductPath(product.title.eg)}/${
                    product._id
                }`}
                className="block h-full"
            >
                <div className="relative overflow-hidden transition-all duration-300">
                    <div className="group relative aspect-[3/4]">
                        <Image
                            src={product.image?.[0] || DefaultImage}
                            alt={product.title.eg || ""}
                            fill
                            className="absolute left-0 top-0 h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.01]"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            priority={index === 0}
                            quality={index < 4 ? 85 : 75}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                            // 3. 이미지 로딩이 완료되면 isImageLoaded 상태를 true로 변경
                            onLoad={() => setIsImageLoaded(true)}
                        />
                    </div>

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
                        <span className="font-amstel-thin sm:font-amstel text-sm font-semibold text-black sm:text-lg">
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
                                <span className="text-sm font-bold text-black sm:text-base">
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
