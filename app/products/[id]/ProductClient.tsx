"use client";

import Image from "next/image";
import DefaultImage from "../../../public/images/chill.png";
import { priceResult, priceDiscount } from "@/src/features/calculate";
import { Posts } from "@/src/entities/type/interfaces";

const ProductClient = ({ posts }: { posts: Posts }) => {
    return (
        posts && (
            <div className="flex h-full w-full flex-col items-center justify-center">
                <div className="grid h-full w-full grid-cols-1 gap-2 pt-32 transition-all duration-300 ease-in-out md:grid-cols-2">
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
                        className="h-full w-full place-self-end md:w-3/4"
                        priority
                    />
                    <div className="flex h-full w-full flex-col items-start justify-center p-5">
                        <div className="mb-1 text-sm font-semibold transition-all duration-700 ease-in-out c_sm:text-base sm:mt-9 md:text-2xl">
                            <p className="font-amstel">{posts.category}</p>
                            <p className="font-pretendard">{posts.title}</p>
                        </div>
                        {posts.discount === "0" || !posts.discount ? (
                            <span className="text-base font-semibold sm:text-4xl">{`KRW ${priceResult(posts)}`}</span>
                        ) : (
                            <div>
                                <p className="font-amstel text-sm transition-all duration-700 ease-in-out c_sm:text-xl md:text-3xl">{`KRW ${priceDiscount(posts)}`}</p>
                                <p className="text-ms font-amstel text-gray-600 line-through transition-all duration-700 ease-in-out c_sm:text-base md:text-xl">{`KRW ${priceResult(posts)}`}</p>
                                <p className="text-base font-semibold text-slate-400 transition-all duration-700 ease-in-out c_sm:text-xl md:text-3xl">{`${posts.discount}%`}</p>
                            </div>
                        )}
                        <p className="my-1 text-gray-700 sm:text-lg">
                            {`colors-${posts.colors}`}
                        </p>

                        {/* 결제 */}
                        <div className="flex h-[100px] w-full items-center justify-center bg-red-50 hover:bg-red-200 sm:h-full sm:w-3/5">
                            Payments Information
                        </div>
                    </div>
                </div>
                <div className="mt-10 w-full md:w-2/4">
                    <Image
                        src={
                            posts.image
                                ? `https://pub-29feff62c6da44ea8503e0dc13db4217.r2.dev/${posts.description}`
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

export default ProductClient;
