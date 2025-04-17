"use client";

import Link from "next/link";
import Image from "next/image";
import DefaultImage from "../../../../public/chill.png";
import { Post } from "@/src/entities/interfaces";
import useProduct from "@/src/shared/hooks/useProduct";

const ProductsList = ({ post }: { post: Post }) => {
    const { priceResult, priceDiscount } = useProduct();

    return (
        <>
            <li className="font-brand mb-24 h-full w-full" key={`${post._id}`}>
                <Link href={`/products/${post._id}`}>
                    <Image
                        src={
                            post.image
                                ? `https://pub-29feff62c6da44ea8503e0dc13db4217.r2.dev/${post.image}`
                                : DefaultImage
                        }
                        alt={post.title}
                        width={500}
                        height={500}
                        style={{ objectFit: "contain" }}
                        priority
                        className="h-auto w-full"
                    />
                    <div className="mb-1 mt-4 text-sm font-semibold transition-all duration-700 ease-in-out c_sm:text-base sm:mt-9 sm:text-2xl">
                        <span>{`[${post.category}]\t${post.title}\t${post.colors} colors`}</span>
                    </div>
                    {post.discount === "0" || !post.discount ? (
                        <span className="text-base font-semibold sm:text-2xl">{`${priceResult(post)}원`}</span>
                    ) : (
                        <div>
                            <span className="text-sm font-semibold transition-all duration-300 ease-in-out c_sm:text-base sm:text-2xl">{`${priceDiscount(post)}원`}</span>
                            <span className="ms-1 font-sans text-xs text-gray-600 line-through transition-all duration-300 ease-in-out sm:ms-4 sm:text-xl md:ms-2">{`${priceResult(post)}원`}</span>
                            <span className="ms-2 text-base font-semibold text-red-700 transition-all duration-300 ease-in-out sm:ms-4 sm:text-2xl">{`${post.discount}%`}</span>
                        </div>
                    )}
                </Link>
            </li>
        </>
    );
};

export default ProductsList;
