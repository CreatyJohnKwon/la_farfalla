"use client";

import { SelectedItem } from "@/src/entities/type/interfaces";

const QuantityRow = ({
    item,
    updateQuantity,
    onDelete,
}: {
    item: SelectedItem;
    updateQuantity: (quantity: number) => void;
    onDelete: (id: string) => void;
}) => {
    const increase = () => updateQuantity(item.quantity + 1);
    const decrease = () =>
        updateQuantity(item.quantity > 1 ? item.quantity - 1 : 1);

    return (
        <div className="font-amstel flex w-3/4 items-center justify-end gap-6 text-black">
            {/* 상품명 + 옵션 표기 */}
            <span className="text-base">{`${item.size} - ${item.color}`}</span>

            {/* 수량 */}
            <div className="flex items-center justify-center gap-2 text-[0.8em] md:text-[1em]">
                <div className="w-8 bg-gray-200 py-1 text-center">
                    {item.quantity}
                </div>
                <button
                    className="w-8 bg-gray-200 py-1 text-center"
                    onClick={increase}
                >
                    +
                </button>
                <button
                    className="w-8 bg-gray-200 py-1 text-center"
                    onClick={decrease}
                >
                    −
                </button>
            </div>

            {/* 개별 금액 */}
            <div className="text-right text-[0.8em] md:text-[1em] -me-3 md:m-0">
                KRW {(item.quantity * item.discountPrice).toLocaleString()}
            </div>

            <button
                onClick={() => onDelete(item.cartItemId)}
                className="right-5 top-3 text-xl font-thin text-black"
            >
                &times;
            </button>
        </div>
    );
};

export default QuantityRow;
