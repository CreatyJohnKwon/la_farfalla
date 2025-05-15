import useCart from "@/src/shared/hooks/useCart";


const Cart = () => {
    const { setCartView } = useCart();

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
                <div className="relative top-5 w-full flex items-center justify-between px-6">
                    <p className="text-sm text-gray-600">총 주문 상품 {totalQuantity}개</p>

                    {/* Cart는 absolute로 가운데 정렬 */}
                    <p className="absolute left-1/2 -translate-x-1/2 text-[2em] text-gray-600 font-amstel">
                        Cart
                    </p>

                    <button
                        onClick={() => setCartView(false)}
                        className="text-3xl font-thin text-black"
                    >
                        &times;
                    </button>
                </div>


                <div className="flex flex-wrap items-center justify-center text-center text-lg font-semibold">
                    
                </div>

                <div className="absolute bottom-10 w-full flex flex-col items-center justify-center space-y-3 sm:flex-row sm:space-x-4 sm:space-y-0 font-amstel">
                    {/* 요소에 따라 버튼 diabled 값 변동 */}
                    <button className="w-full max-w-xs bg-black hover:bg-black/70 px-6 py-3 text-white"
                        disabled={true}
                    >
                        buy now
                    </button>
                    <button
                        onClick={() => setCartView(false)}
                        className="w-full max-w-xs border border-gray-300 px-6 py-3 text-gray-800 bg-white hover:bg-gray-100"
                    >
                        cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
