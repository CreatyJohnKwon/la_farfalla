import { Posts, SelectedItem } from "@/src/entities/type/interfaces";
import Image from "next/image";
import DefaultImg from "../../../../public/images/chill.png";
import { useEffect, useState } from "react";
import useCart from "@/src/shared/hooks/useCart";
import QuantityModal from "@/src/widgets/modal/QuantityModal";

const CartItem = ({ item }: { item: SelectedItem }) => {
    const [product, setProduct] = useState<Posts | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const { setCartDatas, handleDeleteProduct, handleRouteProduct } = useCart();

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
                <div className="h-[5em] w-[3em] bg-gray-300 sm:w-[5em]" />
                <div className="flex w-32 flex-col items-center sm:w-auto sm:gap-2">
                    <div className="mb-1 h-3 w-24 bg-gray-300" />
                    <div className="h-3 w-20 bg-gray-300" />
                </div>
                <div className="h-4 w-16 bg-gray-300" />
            </div>
        );
    }

    return (
        <div className="animate-fade-in flex h-full w-[90%] items-center justify-between opacity-0 transition-opacity duration-500 ease-in-out">
            <Image
                className="w-[3em] transition-all duration-300 hover:scale-105 sm:w-[5em]"
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
            <div
                className="flex w-32 flex-col items-center sm:w-auto sm:gap-2"
                onClick={() => handleRouteProduct(product._id)}
            >
                <span className="font-amstel w-full truncate text-[0.6em] font-[300] hover:underline">
                    {product.title.eg}
                </span>
                <span className="w-full truncate font-pretendard text-[0.6em] font-[300] hover:underline">
                    {product.title.kr}
                </span>
            </div>
            <div>
                <QuantityModal
                    id={item._id}
                    custom="text-[0.6em] w-full"
                    item={item}
                    onDelete={handleDeleteProduct}
                    updateQuantity={(newQty) =>
                        setCartDatas((prev) =>
                            prev.map((i) =>
                                i._id === item._id
                                    ? { ...i, quantity: newQty }
                                    : i,
                            ),
                        )
                    }
                />
            </div>
        </div>
    );
};

export default CartItem;
