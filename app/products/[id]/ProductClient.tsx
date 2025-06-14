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
            <div className="grid h-full w-full grid-cols-1 gap-2 pt-20 transition-all duration-300 ease-in-out md:w-3/4 md:grid-cols-2 md:pt-40">
                {/* 이미지 슬라이더 */}
                <Slider images={product.image} />
                <ProductInfo product={product} />
            </div>
            {/* description 이미지 */}
            <div className="mt-10 w-full md:w-2/4">
                <Image
                    src={
                        product.description.image
                            ? product.description.image
                            : DefaultImage
                    }
                    alt={"product_image_" + id}
                    width={500}
                    height={500}
                    style={{ objectFit: "contain" }}
                    className="h-full w-full"
                    priority
                />
            </div>
        </div>
    );
};

export default ProductClient;
