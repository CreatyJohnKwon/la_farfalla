"use client";

import { SelectedItem } from "@/src/entities/type/interfaces";
import useCart from "@/src/shared/hooks/useCart";
import { useState, useEffect } from "react";

const Cart = () => {
    const [cartItems, setCartItems] = useState<SelectedItem[]>([]);
    const { setCartView } = useCart();

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await fetch("/api/cart");
                if (!res.ok) throw new Error("장바구니 요청 실패");
                const data = await res.json();
                setCartItems(data);
            } catch (err) {
                console.error("장바구니 조회 실패:", err);
            }
        };
        fetchCart();
    }, []);

    const totalQuantity = 10;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setCartView(false)}
        >
            <div
                className="relative h-3/4 w-5/6 bg-white shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mt-3 flex w-full items-center justify-between px-5 sm:mt-5 sm:px-8">
                    <div className="text-sm sm:text-gray-600">
                        <span className="block sm:hidden">
                            총 {totalQuantity}개
                        </span>
                        <span className="hidden text-[1.3em] sm:block">
                            총 주문 상품 {totalQuantity}개
                        </span>
                    </div>

                    {/* Cart는 absolute로 가운데 정렬 */}
                    <p className="font-amstel absolute left-1/2 -translate-x-1/2 text-[1.5em] text-gray-600 sm:text-[2em]">
                        Cart
                    </p>

                    <button
                        onClick={() => setCartView(false)}
                        className="text-[1.5em] font-thin text-black sm:text-[2.2em]"
                    >
                        &times;
                    </button>
                </div>

                <ul className="mt-5 flex h-auto flex-wrap items-center justify-center bg-red-200 text-center text-lg font-semibold">
                    {cartItems.map((item, index) => (
                        <li
                            key={`${item}_${index}`}
                            className="flex w-full items-center justify-center text-[1em] font-semibold sm:text-[2em]"
                        >
                            <p className="me-2">
                                {item.color}-{item.size}
                            </p>
                            <p className="me-2">{item.quantity} 개</p>
                            <p className="text-gray-600">
                                {item.discountPrice} 원
                            </p>
                        </li>
                    ))}
                </ul>

                <div className="font-amstel absolute bottom-10 flex w-full flex-col items-center justify-center space-y-3 text-[1em] sm:flex-row sm:space-x-4 sm:space-y-0 sm:text-[1.2em]">
                    {/* 요소에 따라 버튼 diabled 값 변동 */}
                    <button
                        className="w-full max-w-xs bg-black px-6 py-3 text-white hover:bg-black/70"
                        disabled={true}
                    >
                        buy now
                    </button>
                    <button
                        onClick={() => setCartView(false)}
                        className="w-full max-w-xs border border-gray-300 bg-white px-6 py-3 text-gray-800 hover:bg-gray-100"
                    >
                        cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
