"use client";

import Image from "next/image";
import DefaultImage from "../../../public/chill.png";
import useProduct from "@/src/shared/hooks/useProduct";
import Navbar from "@/src/widgets/Navbar/Navbar";
import { Post } from "@/src/entities/interfaces";

const ProductsClient = ({ post }: { post: Post }) => {
    const { priceResult, priceDiscount } = useProduct();

    return (
        post && (
            <div className="flex h-full w-full flex-col items-center justify-center pb-24">
                <Navbar />
                <div className="font-brand grid w-full grid-cols-1 gap-2 transition-all duration-300 ease-in-out md:grid-cols-2">
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
                        className="h-full w-full place-self-end md:w-3/4"
                        priority
                    />
                    <div className="flex h-full w-full flex-col items-start justify-center p-5">
                        <div className="mb-1 text-sm font-semibold transition-all duration-700 ease-in-out c_sm:text-base c_base:mt-9 md:text-2xl">
                            <span>{`[${post.category}]\t${post.title}`}</span>
                        </div>
                        {post.discount === "0" || !post.discount ? (
                            <span className="text-base font-semibold c_base:text-4xl">{`${priceResult(post)}원`}</span>
                        ) : (
                            <div>
                                <span className="text-sm font-semibold transition-all duration-700 ease-in-out c_sm:text-xl md:text-3xl">{`${priceDiscount(post)}원`}</span>
                                <span className="text-ms ms-1 font-sans text-gray-600 line-through transition-all duration-700 ease-in-out c_sm:text-base md:ms-2 md:text-xl">{`${priceResult(post)}원`}</span>
                                <span className="ms-2 text-base font-semibold text-red-700 transition-all duration-700 ease-in-out c_sm:text-xl md:ms-4 md:text-3xl">{`${post.discount}%`}</span>
                            </div>
                        )}
                        <p className="my-1 text-gray-700 c_base:text-lg">
                            {`colors-${post.colors}`}
                        </p>

                        {/* 결제 */}
                        <div className="flex h-[100px] w-full items-center justify-center bg-red-50 hover:bg-red-200 c_base:h-full c_base:w-3/5">
                            대충 여기다가 결제관련
                        </div>
                    </div>
                </div>
                <div className="mt-10 w-full md:w-2/4">
                    <Image
                        src={
                            post.image
                                ? `https://pub-29feff62c6da44ea8503e0dc13db4217.r2.dev/${post.description}`
                                : DefaultImage
                        }
                        alt={"description Image"}
                        width={500}
                        height={500}
                        style={{ objectFit: "contain" }}
                        className="h-full w-full"
                        priority
                    />
                </div>
            </div>
        )
    );
};

export default ProductsClient;
