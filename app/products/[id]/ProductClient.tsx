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
            <div className="mx-auto items-center flex h-full w-full flex-col gap-3 mt-16 sm:mt-24 md:mt-32 transition-all duration-300 ease-in-out md:w-[90%] md:flex-row md:gap-8 lg:w-[70%] lg:gap-16 lg:mt-32">
                <Slider images={product.image} />
                <ProductInfo product={product} />
            </div>
            {/* description 이미지들 */}
            <div className="mt-[30vh] flex w-full flex-col md:mt-[80vh] md:w-2/5">
                {product.description.images &&
                product.description.images.length > 0 ? (
                    product.description.images.map((image, index) => (
                        <div key={index} className="w-full">
                            <Image
                                src={image || DefaultImage}
                                alt={`product_image_${id}_${index}`}
                                width={500}
                                height={500}
                                className="h-auto w-full object-cover"
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
                        className="h-auto w-full object-cover"
                        priority
                    />
                )}
            </div>
            asdfsdf
        </div>
    );
};

export default ProductClient;
