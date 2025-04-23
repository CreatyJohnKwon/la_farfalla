"use client";

import Link from "next/link";
import Image from "next/image";
import DefaultImage from "../../../../public/chill.png";
import { Posts } from "@/src/entities/type/interfaces";
import { priceResult, priceDiscount } from "@/src/features/calculate";

const ProductsList = ({ posts }: { posts: Posts }) => {
    return (
        <>
            <li
                className="h-screen w-auto text-center font-serif tracking-tighter"
                key={`${posts._id}`}
            >
                <Link href={`/products/${posts._id}`}>
                    <Image
                        src={
                            posts.image
                                ? `https://pub-29feff62c6da44ea8503e0dc13db4217.r2.dev/${posts.image}`
                                : DefaultImage
                        }
                        alt={posts.title}
                        width={1000}
                        height={1000}
                        style={{ objectFit: "contain" }}
                        priority
                        className="-mb-14 h-3/4 w-auto p-2"
                    />
                    <div className="mb-1 mt-4 text-sm transition-all duration-700 ease-in-out c_sm:text-base sm:mt-9 sm:text-2xl">
                        <p>{`[${posts.category}]\t${posts.title}`}</p>
                        <p>{`${posts.colors} colors`}</p>
                    </div>
                    {posts.discount === "0" || !posts.discount ? (
                        <span className="text-base sm:text-2xl">{`KRW ${priceResult(posts)}`}</span>
                    ) : (
                        <div>
                            <p className="ms-1 text-xs text-gray-600 line-through transition-all duration-300 ease-in-out sm:ms-4 sm:text-xl md:ms-2">{`KRW ${priceResult(posts)}`}</p>
                            <span className="text-base text-black transition-all duration-300 ease-in-out sm:me-2 sm:text-2xl">{`${posts.discount}%`}</span>
                            <span className="text-sm transition-all duration-300 ease-in-out c_sm:text-base sm:text-2xl">{`KRW ${priceDiscount(posts)}`}</span>
                        </div>
                    )}
                </Link>
            </li>
        </>
    );
};

export default ProductsList;
