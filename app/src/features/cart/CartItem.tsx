import { Posts, SelectedItem } from "@/src/entities/type/interfaces";
import Image from "next/image";
import DefaultImg from "../../../../public/images/chill.png";
import { useEffect, useState, useCallback } from "react";
import useCart from "@/src/shared/hooks/useCart";
import QuantityModal from "@/src/widgets/modal/QuantityModal";

const CartItem = ({ item }: { item: SelectedItem }) => {
    const [product, setProduct] = useState<Posts | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const { handleUpdateProduct, handleDeleteProduct, handleRouteProduct } =
        useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/product?id=${item.productId}`);
                const data = await res.json();
                setProduct(data);
                // 부드러운 전환을 위해 약간의 delay
                setTimeout(() => setIsLoaded(true), 150); // 150ms 정도
            } catch (err) {
                console.error("상품 정보를 불러오는 데 실패했습니다.", err);
            }
        };
        fetchProduct();
    }, [item.productId]);

    if (!isLoaded || !product) {
        return (
            <div className="flex w-[90%] animate-pulse items-center justify-between">
                <div className="h-[5em] w-[3em] bg-gray-300 c_md:w-[5em]" />
                <div className="flex w-32 flex-col items-center c_md:w-auto c_md:gap-2">
                    <div className="mb-1 h-3 w-24 bg-gray-300" />
                    <div className="h-3 w-20 bg-gray-300" />
                </div>
                <div className="h-4 w-16 bg-gray-300" />
            </div>
        );
    }

    return (
        <div className="flex h-full w-[92%] animate-fade-in items-center justify-between opacity-0 transition-opacity duration-500 ease-in-out">
            <Image
                className="h-auto w-[4.5em] transition-all duration-300 hover:scale-105 sm:w-[5em]"
                alt={`${product.title}_img`}
                width={500}
                height={500}
                src={
                    product.image
                        ? `https://pub-29feff62c6da44ea8503e0dc13db4217.r2.dev/${product.image}`
                        : DefaultImg
                }
                objectFit="cover"
                onClick={() => handleRouteProduct(product._id)}
            />
            <div className="ms-5 flex w-full flex-col items-start justify-center c_md:m-0 c_md:flex-row c_md:items-center">
                <div
                    className="flex flex-col items-center text-start c_md:m-0 c_md:w-full c_md:gap-2 c_md:text-center"
                    onClick={() => handleRouteProduct(product._id)}
                >
                    <span className="font-amstel w-full text-[0.5em] font-[300] hover:underline c_md:text-[0.6em]">
                        {product.title.eg}
                    </span>
                    <span className="w-full font-pretendard text-[0.5em] font-[300] hover:underline c_md:text-[0.6em]">
                        {product.title.kr}
                    </span>
                </div>
                <QuantityModal
                    id={item._id}
                    custom="text-[0.5em] w-full font-amstel flex items-center justify-start sm:justify-end gap-4 text-black c_md:gap-6"
                    item={item}
                    onDelete={handleDeleteProduct}
                    updateQuantity={(newQty) =>
                        handleUpdateProduct(newQty, item)
                    }
                />
            </div>
        </div>
    );
};

export default CartItem;
