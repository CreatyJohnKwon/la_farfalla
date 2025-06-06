"use client";

import Link from "next/link";
import Image from "next/image";
import DefaultImage from "../../../../public/images/chill.png";
import { Posts } from "@src/entities/type/interfaces";
import { priceResult, priceDiscount } from "@src/features/calculate";

const ProductsList = ({
    posts,
    index = 0,
}: {
    posts: Posts;
    index?: number;
}) => {
    return (
        <li
            key={posts._id}
            className="animate-fade-in pt-10 text-center opacity-0"
            style={{ animationDelay: `${index * 50}ms` }} // stagger 효과
        >
            <Link href={`/products/${posts._id}`}>
                <div className="relative w-full overflow-hidden">
                    <div className="pb-[100%]"></div> {/* 1:1 비율 확보 */}
                    <Image
                        src={
                            posts.image
                                ? `https://pub-29feff62c6da44ea8503e0dc13db4217.r2.dev/${posts.image[0]}`
                                : DefaultImage
                        }
                        alt={posts.title.eg}
                        fill
                        className="absolute left-0 top-0 h-full w-full object-cover"
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>

                <div className="pt-2 text-[0.60rem] transition-all duration-700 ease-in-out sm:pt-6 sm:text-[1.05rem] c_xl:text-xl">
                    <p className="font-amstel-thin sm:font-amstel">{`[${posts.category}]`}</p>
                    <p className="font-pretendard">{`${posts.title.kr}`}</p>
                    <p className="font-amstel-thin sm:font-amstel">{`${posts.colors.length} colors`}</p>
                </div>

                {posts.discount === "0" || !posts.discount ? (
                    <span className="font-amstel-thin sm:font-amstel text-base c_xl:text-xl">
                        {`KRW ${priceResult(posts)}`}
                    </span>
                ) : (
                    <div className="font-amstel-thin sm:font-amstel">
                        <p className="text-[0.60rem] text-gray-600 line-through transition-all duration-300 ease-in-out sm:text-lg c_xl:ms-2">
                            {`KRW ${priceResult(posts)}`}
                        </p>
                        <span className="me-1 text-[0.60rem] text-black transition-all duration-300 ease-in-out sm:me-2 sm:text-base c_xl:text-xl">
                            {`${posts.discount}%`}
                        </span>
                        <span className="text-[0.60rem] transition-all duration-300 ease-in-out sm:text-base c_xl:text-xl">
                            {`KRW ${priceDiscount(posts)}`}
                        </span>
                    </div>
                )}
            </Link>
        </li>
    );
};

export default ProductsList;
