"use client";

import Image from "next/image";
import DefaultImage from "../../../public/images/chill.png";
import { Posts } from "@src/entities/type/interfaces";
import ProductInfo from "../../src/components/product/ProductInfo";
import Slider from "@/src/widgets/slider/Slider";

const ProductClient = ({ posts }: { posts: Posts }) => {
    return (
        posts && (
            <div className="flex h-full w-full flex-col items-center justify-center overflow-x-hidden">
                <div className="grid h-full w-full grid-cols-1 gap-2 pt-20 transition-all duration-300 ease-in-out md:w-3/4 md:grid-cols-2 md:pt-40">
                    {/* 이미지 슬라이더 */}
                    <Slider images={posts.image} />
                    <ProductInfo posts={posts} />
                </div>
                {/* description 이미지 */}
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
