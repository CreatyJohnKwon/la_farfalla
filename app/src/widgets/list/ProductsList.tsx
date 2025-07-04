"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import DefaultImage from "../../../../public/images/chill.png";
import { Product } from "@src/entities/type/interfaces";
import { priceResult, priceDiscount } from "@src/features/calculate";

const ProductsList = ({
    product,
    index = 0,
}: {
    product: Product;
    index?: number;
}) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
        <li
            key={product._id}
            className="group animate-fade-in pb-8 text-center opacity-0 md:pb-0"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <Link href={`/products/${product._id}`} className="block h-full">
                <div className="relative overflow-hidden transition-all duration-300 md:group-hover:scale-[1.01]">
                    {/* 3:4 비율 (4/3 * 100% = 133.33%) */}
                    <div className="pb-[133.33%]"></div>

                    {/* 스켈레톤 로딩 */}
                    {!imageLoaded && (
                        <div className="animate-shimmer absolute left-0 top-0 h-full w-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]">
                            <div className="h-full w-full bg-gray-200"></div>
                        </div>
                    )}
                    <Image
                        src={product.image ? product.image[0] : DefaultImage}
                        alt={product.title.eg || ""}
                        width={500}
                        height={500}
                        className={`absolute left-0 top-0 h-full w-full object-cover transition-all duration-500 ${
                            imageLoaded ? "opacity-100" : "opacity-0"
                        }`}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageLoaded(true)}
                    />

                    {/* 호버 오버레이 */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-10"></div>
                </div>

                <div className="pt-2 text-xs transition-all duration-700 ease-in-out sm:text-base">
                    <p className="font-amstel-thin sm:font-amstel text-black transition-colors duration-300 group-hover:text-gray-900">
                        {`[${product.title.eg}]`}
                    </p>
                    <p className="font-pretendard font-medium text-black">
                        {`${product.title.kr}`}
                    </p>
                    <p className="font-amstel-thin sm:font-amstel text-gray-600">
                        {`${product.colors.length} colors`}
                    </p>
                </div>

                <div>
                    {product.discount === "0" || !product.discount ? (
                        <span className="font-amstel-thin sm:font-amstel text-xs font-semibold text-gray-900 sm:text-base">
                            {`KRW ${priceResult(product)}`}
                        </span>
                    ) : (
                        <div className="font-amstel-thin sm:font-amstel space-y-1">
                            <p className="text-xs text-gray-500 line-through transition-all duration-300 ease-in-out sm:text-base">
                                {`KRW ${priceResult(product)}`}
                            </p>
                            <div className="flex items-center justify-center space-x-2">
                                <span className="rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white sm:px-3 sm:py-1 sm:text-sm">
                                    {`${product.discount}%`}
                                </span>
                                <span className="text-xs font-bold text-red-600 sm:text-base">
                                    {`KRW ${priceDiscount(product)}`}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </Link>
        </li>
    );
};

export default ProductsList;
