"use client";

import useCart from "@/src/shared/hooks/useCart";
import { useState, useEffect } from "react";
import CartItem from "./CartItem";
import { getCart } from "@/src/shared/lib/server/cart";

const Cart = () => {
    const [totalQuantity, setTotalQuantity] = useState<number>(0);
    const { cartDatas, setCartDatas, setCartView } = useCart();

    useEffect(() => {
        const getCartItems = async () => {
            const datas: any = await getCart();
            if (datas) {
                setCartDatas(datas);
                setTotalQuantity(datas.reduce((sum: any, item: any) => sum + item.quantity, 0));
            }
            else if (datas === null) alert("장바구니 조회 중 오류가 발생했습니다\n고객센터에 문의해주세요");
        }
        getCartItems();
    }, []);

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
                    {cartDatas.map((item, index) => (
                        <li
                            key={`${item}_${index}`}
                            className="flex w-full items-center justify-center text-[1em] font-semibold sm:text-[2em]"
                        >
                            <CartItem item={item} />
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
