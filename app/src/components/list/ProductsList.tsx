"use client";

import Link from "next/link";
import Image from "next/image";
import DefaultImage from "../../../../public/chill.png";
import { Posts } from "@/src/entities/type/interfaces";
import { priceResult, priceDiscount } from "@/src/features/calculate";

const ProductsList = ({ posts }: { posts: Posts }) => {
    return (
        <>
            <li className="font-brand mb-24 h-full w-full" key={`${posts._id}`}>
                <Link href={`/products/${posts._id}`}>
                    <Image
                        src={
                            posts.image
                                ? `https://pub-29feff62c6da44ea8503e0dc13db4217.r2.dev/${posts.image}`
                                : DefaultImage
                        }
                        alt={posts.title}
                        width={500}
                        height={500}
                        style={{ objectFit: "contain" }}
                        priority
                        className="h-auto w-full"
                    />
                    <div className="mb-1 mt-4 text-sm font-semibold transition-all duration-700 ease-in-out c_sm:text-base sm:mt-9 sm:text-2xl">
                        <span>{`[${posts.category}]\t${posts.title}\t${posts.colors} colors`}</span>
                    </div>
                    {posts.discount === "0" || !posts.discount ? (
                        <span className="text-base font-semibold sm:text-2xl">{`${priceResult(posts)}원`}</span>
                    ) : (
                        <div>
                            <span className="text-sm font-semibold transition-all duration-300 ease-in-out c_sm:text-base sm:text-2xl">{`${priceDiscount(posts)}원`}</span>
                            <span className="ms-1 font-sans text-xs text-gray-600 line-through transition-all duration-300 ease-in-out sm:ms-4 sm:text-xl md:ms-2">{`${priceResult(posts)}원`}</span>
                            <span className="ms-2 text-base font-semibold text-red-700 transition-all duration-300 ease-in-out sm:ms-4 sm:text-2xl">{`${posts.discount}%`}</span>
                        </div>
                    )}
                </Link>
            </li>
        </>
    );
};

export default ProductsList;
