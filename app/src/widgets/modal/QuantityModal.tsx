"use client";

import { SelectedItem } from "@/src/entities/type/interfaces";

const QuantityModal = ({
    id,
    custom,
    item,
    updateQuantity,
    onDelete,
}: {
    id: string | undefined;
    custom?: string;
    item: SelectedItem;
    updateQuantity: (quantity: number) => void;
    onDelete: (id: string | undefined) => void;
}) => {
    const increase = () => updateQuantity(item.quantity + 1);
    const decrease = () =>
        updateQuantity(item.quantity > 1 ? item.quantity - 1 : 1);

    return (
        <div
            className={`${custom} font-amstel flex items-center justify-end gap-6 text-black`}
        >
            {/* 상품명 + 옵션 표기 */}
            <span>{`${item.size} - ${item.color}`}</span>

            {/* 수량 */}
            <div className="flex items-center justify-center gap-2">
                <div className="flex aspect-square w-7 items-center justify-center bg-gray-200 text-center text-xs sm:w-10 sm:text-sm">
                    {item.quantity}
                </div>
                <button
                    className="flex aspect-square w-7 items-center justify-center bg-gray-200 text-center text-xs transition hover:bg-gray-300 active:scale-95 sm:w-10 sm:text-sm"
                    onClick={increase}
                >
                    +
                </button>
                <button
                    className="flex aspect-square w-7 items-center justify-center bg-gray-200 text-center text-xs transition hover:bg-gray-300 active:scale-95 sm:w-10 sm:text-sm"
                    onClick={decrease}
                >
                    −
                </button>
            </div>

            {/* 개별 금액 */}
            <div className="-me-3 text-right md:m-0">
                KRW {(item.quantity * item.discountPrice).toLocaleString()}
            </div>

            <button
                onClick={() => onDelete(id)}
                className="right-5 top-3 font-thin text-black"
            >
                &times;
            </button>
        </div>
    );
};

export default QuantityModal;
