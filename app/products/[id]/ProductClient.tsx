"use client";

import Image from "next/image";
import DefaultImage from "../../../public/images/chill.png";
import ProductInfo from "../../src/components/product/ProductInfo";
import Slider from "@/src/widgets/slider/Slider";
import { useProductQuery } from "@/src/shared/hooks/react-query/useProductQuery";

const ProductClient = ({ id }: { id: string }) => {
    const { data: product, isLoading: productLoading } = useProductQuery(id);

    if (productLoading) return <div>Loading...</div>;
    if (!product) return <div>상품을 불러올 수 없습니다.</div>;

    return (
        <div className="flex h-full w-full flex-col items-center justify-center overflow-x-hidden">
            <div className="grid h-full w-full grid-cols-1 gap-2 pt-20 transition-all duration-300 ease-in-out md:w-4/6 md:grid-cols-2 md:pt-40">
                {/* 이미지 슬라이더 */}
                <Slider images={product.image} />
                <ProductInfo product={product} />
            </div>
            {/* description 이미지들 */}
            <div className="mt-[80vh] flex w-full flex-col md:w-2/5">
                {product.description.images &&
                product.description.images.length > 0 ? (
                    product.description.images.map((image, index) => (
                        <div key={index} className="w-full">
                            <Image
                                src={image || DefaultImage}
                                alt={`product_image_${id}_${index}`}
                                width={500}
                                height={500}
                                style={{ objectFit: "contain" }}
                                className="h-auto w-full"
                                priority={index === 0} // 첫 번째 이미지만 priority
                            />
                        </div>
                    ))
                ) : (
                    <Image
                        src={DefaultImage}
                        alt={`product_image_${id}_default`}
                        width={500}
                        height={500}
                        style={{ objectFit: "contain" }}
                        className="h-auto w-full"
                        priority
                    />
                )}
            </div>
        </div>
    );
};

export default ProductClient;
