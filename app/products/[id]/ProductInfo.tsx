"use client";

import {
    priceResult,
    priceDiscount,
    justDiscount,
} from "@/src/features/calculate";
import { Posts, SelectedItem } from "@/src/entities/type/interfaces";
import ProductDrop from "@/src/widgets/drop/ProductDrop";
import QuantityRow from "@/src/features/quantity/QuantityRow";
import { useEffect, useState } from "react";

const ProductInfo = ({ posts }: { posts: Posts }) => {
    const [count, setCount] = useState<number>(1);
    const [result, setResult] = useState<string>(priceDiscount(posts));
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
    const [selectedSize, setSelectedSize] = useState<string | "">("");
    const [selectedColor, setSelectedColor] = useState<string | "">("");

    const handleAddToCart = async () => {
        try {
            const res = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(selectedItems),
            });

            if (!res.ok) throw new Error("저장 실패");

            alert("장바구니에 담겼습니다.");
            // 필요시 selectedItems 초기화
            setSelectedItems([]);
        } catch (err) {
            console.error(err);
            alert("장바구니 저장 중 오류가 발생했습니다.");
        }
    };

    // 옵션 첫 선택
    const handleSelect = (size: string, color: string) => {
        const alreadyExists = selectedItems.find(
            (item) => item.size === size && item.color === color,
        );

        if (alreadyExists) {
            alert("이미 선택한 옵션입니다.");
            return;
        }

        const newItem = {
            cartItemId: crypto.randomUUID(),
            productId: posts._id,
            size,
            color,
            quantity: 1,
            discountPrice: justDiscount(posts),
            originalPrice: parseInt(posts.price),
        };

        setSelectedItems((prev) => [...prev, newItem]);

        // 선택 initialization :  흐름 개선
        setSelectedSize("");
        setSelectedColor("");
    };

    useEffect(() => {
        if (selectedSize && selectedColor) {
            handleSelect(selectedSize, selectedColor);
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
            <span className="w-4/6 text-center font-pretendard text-[0.8em] font-[300]">
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
                <QuantityRow
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
                    <span className="me-1 font-pretendard font-[300]">
                        총 상품금액(수량) :
                    </span>
                    <span className="font-amstel mb-2 text-[2.2em]">
                        {result}
                    </span>
                    <span className="ms-2 font-pretendard font-[300]">
                        {`(${count}개)`}
                    </span>
                </div>
            ) : (
                <div>{/* 빈칸 추가 */}</div>
            )}

            <div className="font-amstel flex w-3/4 justify-between gap-14">
                <button className="w-1/2 bg-gray-200 py-5 text-center text-base text-black hover:bg-gray-300">
                    buy now
                </button>
                <button
                    className="w-1/2 bg-gray-200 py-5 text-center text-base text-black hover:bg-gray-300"
                    onClick={() => handleAddToCart()}
                >
                    cart
                </button>
            </div>
        </div>
    );
};

export default ProductInfo;
