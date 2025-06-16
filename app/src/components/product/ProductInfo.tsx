"use client";

import {
    priceResult,
    priceDiscount,
    justDiscount,
} from "@src/features/calculate";
import { Product } from "@src/entities/type/interfaces";
import ProductDrop from "@src/widgets/drop/ProductDrop";
import QuantityModal from "@src/widgets/modal/QuantityModal";
import { useEffect } from "react";
import useCart from "@src/shared/hooks/useCart";
import useUser from "@src/shared/hooks/useUsers";
import { redirect } from "next/navigation";

const ProductInfo = ({ product }: { product: Product }) => {
    const {
        count,
        setCount,
        result,
        setResult,
        selectedSize,
        setSelectedSize,
        selectedColor,
        setSelectedColor,
        selectedItems,
        setSelectedItems,
        handleBuy,
        handleSelect,
        handleAddToCart,
    } = useCart();
    const { session } = useUser();

    useEffect(() => {
        if (selectedSize && selectedColor) {
            handleSelect(selectedSize, selectedColor, product);
        }
    }, [selectedSize, selectedColor]);

    useEffect(() => {
        const temp = selectedItems.reduce(
            (sum, item) => sum + item.quantity,
            0,
        );
        const tempCalc = justDiscount(product) * temp;

        setCount(temp);
        setResult(tempCalc.toLocaleString());
    }, [selectedItems]);

    return (
        <div className="w-full md:w-1/2">
            <div className="mt-3 flex h-full flex-col items-center justify-center gap-3 md:mt-0 md:gap-3 lg:gap-3 xl:gap-4">
                {/* title */}
                <div className="flex flex-col items-center gap-2 text-center md:gap-3 lg:gap-4 xl:gap-5">
                    <span className="font-amstel w-[90vw] text-3xl md:text-4xl c_xl:text-6xl">
                        {product.title.eg}
                    </span>
                    <span className="-mt-1 font-pretendard text-lg font-[300] md:text-xl xl:text-2xl">
                        {product.title.kr}
                    </span>
                </div>

                {/* Description text */}
                <span className="w-full px-2 text-center font-pretendard text-sm font-[200] c_xl:text-base">
                    {product.description.text}
                </span>

                {/* price */}
                {product.discount === "0" || !product.discount ? (
                    <div className="font-amstel text-base md:text-lg">{`KRW ${priceResult(product)}`}</div>
                ) : (
                    <>
                        <div className="font-amstel text-base md:text-lg">
                            <span className="pe-2">{`${product.discount}%`}</span>
                            <span className="font-amstel-thin text-gray-500 line-through">{`KRW ${priceResult(product)}`}</span>
                        </div>
                        <span className="font-amstel -mt-1 text-base text-black md:-mt-2 md:text-lg">{`KRW ${priceDiscount(product)}`}</span>
                    </>
                )}

                {/* size drop */}
                <div className="flex w-full flex-col gap-2 px-2 md:w-4/5 md:gap-3 md:px-0 lg:w-3/4">
                    <ProductDrop
                        title={"size"}
                        items={product.size}
                        selected={selectedSize}
                        setSelected={setSelectedSize}
                    />
                    <ProductDrop
                        title={"color"}
                        items={product.colors}
                        selected={selectedColor}
                        setSelected={setSelectedColor}
                    />
                </div>

                {/* 상품 추가 */}
                {selectedItems.map((item) => (
                    <QuantityModal
                        id={item.cartItemId}
                        custom="w-full text-sm md:text-base font-amstel flex items-center justify-end gap-2 md:gap-4 text-black c_md:gap-6 px-2 md:px-0"
                        key={item.cartItemId}
                        item={item}
                        onDelete={(id) => {
                            setSelectedItems((prev) =>
                                prev.filter((i) => i.cartItemId !== id),
                            );
                        }}
                        updateQuantity={(newQty) => {
                            setSelectedItems((prev) =>
                                prev.map((i) =>
                                    i.cartItemId === item.cartItemId
                                        ? { ...i, quantity: newQty }
                                        : i,
                                ),
                            );
                        }}
                    />
                ))}

                {selectedItems.length > 0 ? (
                    <div className="flex w-full items-center justify-end px-2 text-center text-black md:px-0">
                        <span className="me-1 font-pretendard text-xs font-[300] md:text-sm lg:text-base">
                            총 상품금액(수량) :
                        </span>
                        <span className="font-amstel mb-1 text-lg md:mb-2 md:text-xl lg:text-2xl xl:text-[2em]">
                            {result}
                        </span>
                        <span className="ms-1 font-pretendard text-xs font-[300] md:ms-2 md:text-sm lg:text-base">
                            {`(${count}개)`}
                        </span>
                    </div>
                ) : (
                    <div className="h-4 md:h-6">{/* 빈칸 추가 */}</div>
                )}

                <div className="font-amstel flex w-full justify-between gap-4 px-2 md:w-5/6 md:gap-6 md:px-0 lg:gap-8 xl:gap-10">
                    <button
                        className="w-1/2 bg-gray-200 py-2 text-center text-sm text-black transition-colors hover:bg-gray-300 md:py-3 md:text-lg lg:text-xl"
                        disabled={selectedItems.length === 0}
                        onClick={() => {
                            if (!session) {
                                alert("로그인이 필요합니다.");
                                return redirect("/login");
                            }
                            handleBuy(selectedItems);
                        }}
                    >
                        buy now
                    </button>
                    <button
                        className="w-1/2 bg-gray-200 py-2 text-center text-sm text-black transition-colors hover:bg-gray-300 md:py-3 md:text-lg lg:text-xl"
                        disabled={selectedItems.length === 0}
                        onClick={() => handleAddToCart()}
                    >
                        cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductInfo;
