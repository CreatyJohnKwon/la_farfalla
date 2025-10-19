"use client";

import useCart from "@src/shared/hooks/useCart";
import { useState, useEffect } from "react";
import { getCart } from "@src/shared/lib/server/cart";
import { SelectedItem } from "@/src/entities/type/common";
import CartItem from "./CartItem";
import CartItemSkeleton from "./CartItemSkeleton";

const Cart = () => {
    const [totalQuantity, setTotalQuantity] = useState<number>(0);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const {
        cartDatas,
        setCartDatas,
        setCartView,
        handleBuy,
        handleRemoveCartAll
    } = useCart();

    useEffect(() => {
        const getCartItems = async () => {
            const datas = await getCart();
            if (datas) {
                setCartDatas(datas);
            } else {
                alert(
                    "장바구니 조회 중 오류가 발생했습니다\n고객센터에 문의해주세요",
                );
            }
        };
        getCartItems();
    }, [setCartDatas]);

    useEffect(() => {
        if (!cartDatas) return;

        setTotalQuantity(
            cartDatas.reduce(
                (sum: number, item: SelectedItem) => sum + item.quantity,
                0,
            ),
        );
        setTotalPrice(
            cartDatas.reduce(
                (sum: number, item: SelectedItem) =>
                    sum + item.discountPrice * item.quantity,
                0,
            ),
        );
    }, [cartDatas]);

    useEffect(() => {
        document.body.style.overflow = "hidden";
        // 컴포넌트가 언마운트될 때 body 스크롤을 복원합니다.
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const cartListView = () => {
        if (cartDatas && cartDatas.length > 0) {
            return cartDatas.map((item: SelectedItem, index: number) => (
                <li
                    key={`${item.productId}_${index}_list`}
                    className="flex w-full flex-col items-center justify-center font-semibold"
                >
                    <CartItem
                        key={`${item.productId}_${index}_item`}
                        item={item}
                        onClose={() => setCartView(false)}
                    />
                </li>
            ));
        } else if (cartDatas && cartDatas.length === 0) {
            return (
                <div className="text-base font-pretendard text-gray-500 flex items-center justify-center mt-10">
                    <span>장바구니에 상품을 담아주세요</span>
                </div>
            )
        }
        
        return <CartItemSkeleton count={5} />
    };

    return (
        // 오버레이: 화면 전체를 덮고 클릭 시 장바구니를 닫습니다.
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setCartView(false)}
        >
            {/* 장바구니 컨테이너: 이벤트 버블링을 막습니다. */}
            <div
                className="flex h-full w-full flex-col overflow-hidden bg-white sm:h-4/5 sm:w-11/12 sm:max-w-2xl sm:rounded-sm"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 헤더 */}
                <div className="relative flex w-full flex-shrink-0 items-center justify-between border-b p-4 sm:p-6">
                    {/* sm 사이즈부터 글자 크기를 base로 고정합니다. */}
                    <div className="text-sm text-gray-600 sm:text-base">
                        총 {totalQuantity}개
                    </div>
                    {/* sm 사이즈부터 글자 크기를 2xl로 고정합니다. */}
                    <p className="font-amstel absolute left-1/2 -translate-x-1/2 text-lg font-semibold text-black sm:text-2xl">
                        Cart
                    </p>
                    <button
                        onClick={() => setCartView(false)}
                        className="text-2xl font-thin text-black sm:text-3xl mb-2"
                    >
                        &times;
                    </button>
                </div>

                {/* 장바구니 목록: 남은 공간을 모두 차지하고 내용이 많으면 스크롤됩니다. */}
                <ul className="flex-grow overflow-y-auto">
                    {cartListView()}
                </ul>

                {/* 푸터 */}
                <div className="w-full flex-shrink-0 border-t bg-white p-4 sm:p-6">
                    {/* sm 사이즈부터 글자 크기를 2xl로 고정합니다. */}
                    <span className="font-amstel mb-4 flex w-full items-center justify-center text-lg text-black sm:text-2xl">
                        {`Total KRW ${totalPrice.toLocaleString()}`}
                    </span>
                    <div className="font-amstel flex flex-col items-center justify-center text-base sm:text-lg">
                        <button
                            className="w-full bg-black px-6 py-3 text-white transition-colors hover:bg-black/70 disabled:cursor-not-allowed disabled:bg-gray-400 sm:w-auto sm:min-w-[250px]"
                            onClick={() => {
                                if (!cartDatas || cartDatas.length === 0) return;
                                handleBuy(cartDatas);
                                handleRemoveCartAll();
                                setCartDatas([]);
                                setCartView(false);
                            }}
                            disabled={!cartDatas || cartDatas.length === 0}
                        >
                            buy now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
