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
            className="animate-fade-in pt-10 text-center opacity-0"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <Link href={`/products/${product._id}`}>
                <div className="relative w-full overflow-hidden">
                    <div className="pb-[100%]"></div> {/* 1:1 비율 확보 */}
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
                        className={`absolute left-0 top-0 h-full w-full object-cover transition-opacity duration-300 ${
                            imageLoaded ? "opacity-100" : "opacity-0"
                        }`}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageLoaded(true)} // 에러 시에도 스켈레톤 제거
                    />
                </div>

                <div className="pt-2 text-[0.60rem] transition-all duration-700 ease-in-out sm:pt-6 sm:text-[1.05rem] c_xl:text-xl">
                    <p className="font-amstel-thin sm:font-amstel">{`[${product.title.eg}]`}</p>
                    <p className="font-pretendard">{`${product.title.kr}`}</p>
                    <p className="font-amstel-thin sm:font-amstel">{`${product.colors.length} colors`}</p>
                </div>

                {product.discount === "0" || !product.discount ? (
                    <span className="font-amstel-thin sm:font-amstel text-base c_xl:text-xl">
                        {`KRW ${priceResult(product)}`}
                    </span>
                ) : (
                    <div className="font-amstel-thin sm:font-amstel">
                        <p className="text-[0.60rem] text-gray-600 line-through transition-all duration-300 ease-in-out sm:text-lg c_xl:ms-2">
                            {`KRW ${priceResult(product)}`}
                        </p>
                        <span className="me-1 text-[0.60rem] text-black transition-all duration-300 ease-in-out sm:me-2 sm:text-base c_xl:text-xl">
                            {`${product.discount}%`}
                        </span>
                        <span className="text-[0.60rem] transition-all duration-300 ease-in-out sm:text-base c_xl:text-xl">
                            {`KRW ${priceDiscount(product)}`}
                        </span>
                    </div>
                )}
            </Link>
        </li>
    );
};

export default ProductsList;
