"use client";

import Image from "next/image";
import DefaultImage from "../../../../public/images/chill.png";
import Slider from "@/src/widgets/slider/Slider";
import { Product } from "@/src/entities/type/interfaces";
import ProductInfo from "@/src/components/product/ProductInfo";
import Modal from "./Modal";

const PreviewProductModal = ({
    product,
    onClose,
}: {
    product: Product;
    onClose: () => void;
}) => {
    if (!product) return <div>상품을 불러올 수 없습니다.</div>;

    const getImageSrc = (image: string | File): string => {
        if (typeof image === "string") return image;
        return URL.createObjectURL(image);
    };

    return (
        <Modal
            onClose={onClose}
            className="h-[90vh] w-[90vw] overflow-y-auto bg-white"
        >
            <div className="flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden">
                <div className="grid h-full w-full grid-cols-1 gap-2 pt-20 transition-all duration-300 ease-in-out md:w-3/4 md:grid-cols-2 md:pt-40">
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
                                    src={getImageSrc(image)}
                                    alt={`product_image_${index}`}
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
                            alt={`product_image_default`}
                            width={500}
                            height={500}
                            style={{ objectFit: "contain" }}
                            className="h-auto w-full"
                            priority
                        />
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default PreviewProductModal;
