"use client";

import useCart from "@src/shared/hooks/useCart";
import { useState, useEffect } from "react";
import CartItem from "./CartItem";
import { getCart } from "@src/shared/lib/server/cart";
import { SelectedItem } from "@src/entities/type/interfaces";

const Cart = () => {
    const [totalQuantity, setTotalQuantity] = useState<number>(0);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const {
        cartDatas,
        setCartDatas,
        setCartView,
        handleBuy,
        handleRemoveCartAll,
    } = useCart();

    useEffect(() => {
        if (cartDatas.length === 0) {
            const getCartItems = async () => {
                const datas: any = await getCart();
                if (datas) {
                    setCartDatas(datas);
                } else if (datas === null)
                    alert(
                        "장바구니 조회 중 오류가 발생했습니다\n고객센터에 문의해주세요",
                    );
            };
            getCartItems();
        }
    }, []);

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

    // 서칭
    useEffect(() => {
        // 팝업 열릴 때 스크롤 막기
        document.body.style.overflow = "hidden";

        // 컴포넌트 언마운트 시 복원
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const cartListView = () => {
        if (cartDatas.length > 0) {
            return cartDatas.map((item: SelectedItem, index: number) => (
                <li
                    key={`${item.productId}_${index}_list`}
                    className="flex w-full flex-col items-center justify-center text-[1em] font-semibold sm:text-[2em]"
                >
                    <CartItem
                        key={`${item.productId}_${index}_item`}
                        item={item}
                    />
                </li>
            ));
        } else {
            return (
                <li
                    key={"unknown_datas"}
                    className="font-pretendard text-[0.8em] font-[300] text-black sm:text-[1em]"
                >
                    장바구니가 비었습니다
                </li>
            );
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setCartView(false)}
        >
            <div
                className="relative h-4/5 w-11/12 bg-white"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mt-3 flex w-full items-center justify-between px-5 sm:mt-5 sm:px-8">
                    <div className="text-sm sm:text-gray-600">
                        {/* Mobile */}
                        <span className="block sm:hidden">
                            총 {totalQuantity}개
                        </span>
                        {/* PC */}
                        <span className="hidden text-base sm:block">
                            총 주문 상품 {totalQuantity}개
                        </span>
                    </div>

                    <p className="font-amstel absolute left-1/2 -translate-x-1/2 text-base text-black sm:text-2xl">
                        Cart
                    </p>

                    <button
                        onClick={() => setCartView(false)}
                        className="text-xl font-thin text-black sm:text-3xl"
                    >
                        &times;
                    </button>
                </div>

                <ul className="mt-10 flex max-h-[68%] flex-wrap items-center justify-center gap-10 overflow-x-auto overflow-y-auto text-center text-lg font-semibold sm:max-h-[60%] sm:p-2">
                    {cartListView()}
                </ul>

                <div className="absolute bottom-6 w-full">
                    <span className="font-amstel mb-5 flex w-full items-center justify-center text-base sm:text-3xl">
                        {`Total' KRW ${totalPrice.toLocaleString()}`}
                    </span>
                    <div className="font-amstel flex flex-col items-center justify-center space-y-3 text-base sm:flex-row sm:space-x-4 sm:space-y-0 sm:text-xl">
                        <button
                            className="w-[80vw] bg-black px-6 py-3 text-white hover:bg-black/70 sm:max-w-[30vw]"
                            onClick={() => {
                                handleBuy(cartDatas); // 구매하기
                                handleRemoveCartAll(); // 장바구니 아이템 전부 비우기
                                setCartDatas([]); // 장바구니 비우기
                                setCartView(false); // 팝업 닫기
                            }}
                            disabled={cartDatas.length === 0}
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
