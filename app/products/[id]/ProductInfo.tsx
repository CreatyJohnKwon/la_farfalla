"use client";

import {
    priceResult,
    priceDiscount,
    justDiscount,
} from "@/src/features/calculate";
import { Posts } from "@/src/entities/type/interfaces";
import ProductDrop from "@/src/widgets/drop/ProductDrop";
import QuantityModal from "@/src/widgets/modal/QuantityModal";
import { useEffect } from "react";
import useCart from "@/src/shared/hooks/useCart";

const ProductInfo = ({ posts }: { posts: Posts }) => {
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
        handleSelect,
        handleAddToCart,
    } = useCart();

    useEffect(() => {
        if (selectedSize && selectedColor) {
            handleSelect(selectedSize, selectedColor, posts);
        }
    }, [selectedSize, selectedColor]);

    useEffect(() => {
        const temp = selectedItems.reduce(
            (sum, item) => sum + item.quantity,
            0,
        );
        const tempCalc = justDiscount(posts) * temp;

        setCount(temp);
        setResult(tempCalc.toLocaleString());
    }, [selectedItems]);

    return (
        <div className="mt-5 flex h-full w-full flex-col items-center justify-center gap-6 md:col-span-1 md:mt-0">
            {/* title */}
            <div className="flex flex-col items-center">
                <span className="font-amstel text-[1.3em] md:text-[1.7em]">
                    {posts.title.eg}
                </span>
                <span className="-mt-1 font-pretendard text-[0.8em] md:text-[1em]">
                    {posts.title.kr}
                </span>
            </div>

            {/* Description text */}
            <span className="w-9/12 text-center font-pretendard text-[0.8em] font-[300]">
                {posts.description.text}
            </span>

            {/* price */}
            {posts.discount === "0" || !posts.discount ? (
                <div className="font-amstel text-[1em]">{`KRW ${priceResult(posts)}`}</div>
            ) : (
                <>
                    <div className="font-amstel text-[1em]">
                        <span className="pe-2">{`${posts.discount}%`}</span>
                        <span className="font-amstel-thin text-gray-500 line-through">{`KRW ${priceResult(posts)}`}</span>
                    </div>
                    <span className="font-amstel -mt-2 text-[1em] text-black">{`KRW ${priceDiscount(posts)}`}</span>
                </>
            )}

            {/* size drop */}
            <div className="flex w-4/5 flex-col gap-3 md:w-3/4">
                <ProductDrop
                    title={"size"}
                    items={posts.size}
                    selected={selectedSize}
                    setSelected={setSelectedSize}
                />
                <ProductDrop
                    title={"color"}
                    items={posts.colors}
                    selected={selectedColor}
                    setSelected={setSelectedColor}
                />
            </div>

            {/* 상품 추가 */}
            {selectedItems.map((item) => (
                <QuantityModal
                    id={item.cartItemId}
                    custom="w-3/4 text-[0.8em] md:text-[1em] font-amstel flex items-center justify-end gap-4 text-black c_md:gap-6"
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
                <div className="flex w-3/4 items-center justify-end text-center text-black">
                    <span className="me-1 font-pretendard text-[0.8em] font-[300] md:text-[1em]">
                        총 상품금액(수량) :
                    </span>
                    <span className="font-amstel mb-2 text-[2em] md:text-[2.2em]">
                        {result}
                    </span>
                    <span className="ms-2 font-pretendard text-[0.8em] font-[300] md:text-[1em]">
                        {`(${count}개)`}
                    </span>
                </div>
            ) : (
                <div>{/* 빈칸 추가 */}</div>
            )}

            <div className="font-amstel flex w-3/4 justify-between gap-14">
                <button
                    className="w-1/2 bg-gray-200 py-5 text-center text-base text-black hover:bg-gray-300"
                    disabled={selectedItems.length === 0}
                >
                    buy now
                </button>
                <button
                    className="w-1/2 bg-gray-200 py-5 text-center text-base text-black hover:bg-gray-300"
                    disabled={selectedItems.length === 0}
                    onClick={() => handleAddToCart()}
                >
                    cart
                </button>
            </div>
        </div>
    );
};

export default ProductInfo;
