"use client";

import useCart from "@/src/shared/hooks/useCart";

const Cart = () => {
    const { setCartView } = useCart();

    const productPrice = 36000;
    const shipping = 3000;
    const discount = 3600;
    const total = productPrice + shipping - discount;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setCartView(false)}
        >
            <div
                className="relative h-3/4 w-3/4 bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 닫기 버튼 */}
                <button
                    onClick={() => setCartView(false)}
                    className="absolute right-5 top-3 text-3xl font-thin text-black"
                >
                    &times;
                </button>

                <p className="mb-4 text-sm text-gray-600">총 주문 상품 1개</p>

                <div className="flex flex-wrap items-center justify-center text-center text-lg font-semibold">
                    <div className="mx-2">
                        <p className="text-black">
                            KRW {productPrice.toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">상품금액</p>
                    </div>
                    <p className="mx-2">+</p>
                    <div className="mx-2">
                        <p className="text-black">
                            KRW {shipping.toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">배송비</p>
                    </div>
                    <p className="mx-2">-</p>
                    <div className="mx-2">
                        <p className="text-rose-500">
                            KRW {discount.toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            상품 할인금액
                        </p>
                    </div>
                    <p className="mx-2">=</p>
                    <div className="mx-2">
                        <p className="text-xl font-bold text-black">
                            KRW {total.toLocaleString()}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            총 주문금액
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col items-center justify-center space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0">
                    <button className="w-full max-w-xs bg-black px-6 py-3 text-white">
                        주문하기
                    </button>
                    <button
                        onClick={() => setCartView(false)}
                        className="w-full max-w-xs border border-gray-300 px-6 py-3 text-gray-800"
                    >
                        계속 쇼핑하기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
