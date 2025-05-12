"use client";

import Image from "next/image";
import DefaultImage from "../../../public/images/chill.png";
import { Posts } from "@/src/entities/type/interfaces";
import ProductInfo from "./ProductInfo";

const ProductClient = ({ posts }: { posts: Posts }) => {
    return (
        posts && (
            <div className="flex h-full w-full flex-col items-center justify-center">
                <div className="grid h-full w-3/4 grid-cols-1 gap-2 pt-40 transition-all duration-300 ease-in-out md:grid-cols-2">
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
                        className="h-full w-full place-self-end md:col-span-1"
                        priority
                    />
                    <ProductInfo posts={posts} />
                </div>
                <div className="mt-10 w-full md:w-2/4">
                    <Image
                        src={
                            posts.description.image
                                ? `https://pub-29feff62c6da44ea8503e0dc13db4217.r2.dev/${posts.description.image}`
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
