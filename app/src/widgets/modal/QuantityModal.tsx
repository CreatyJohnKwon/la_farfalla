"use client";

import { SelectedItem } from "@src/entities/type/interfaces";

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
        <div className={`${custom} flex-wrap md:flex-nowrap`}>
            {/* 상품명 + 옵션 표기 */}
            <span className="min-w-0 flex-shrink-0 truncate text-xs md:text-sm lg:text-base">
                {`${item.size} - ${item.color}`}
            </span>

            {/* 수량 */}
            <div className="flex flex-shrink-0 items-center justify-center gap-1 md:gap-2">
                <div className="flex aspect-square w-6 items-center justify-center bg-gray-200 text-center text-xs md:w-8 md:text-sm lg:w-10">
                    {item.quantity}
                </div>
                <button
                    className="flex aspect-square w-6 items-center justify-center bg-gray-200 text-center text-xs transition hover:bg-gray-300 active:scale-95 md:w-8 md:text-sm lg:w-10"
                    onClick={increase}
                >
                    +
                </button>
                <button
                    className="flex aspect-square w-6 items-center justify-center bg-gray-200 text-center text-xs transition hover:bg-gray-300 active:scale-95 md:w-8 md:text-sm lg:w-10"
                    onClick={decrease}
                >
                    −
                </button>
            </div>

            {/* 개별 금액 */}
            <div className="min-w-0 flex-shrink-0 text-right text-xs md:text-sm lg:text-base">
                KRW {(item.quantity * item.discountPrice).toLocaleString()}
            </div>

            <button
                onClick={() => onDelete(id)}
                className="ml-2 flex-shrink-0 text-lg font-thin text-black transition-colors hover:text-red-500 md:text-xl"
            >
                &times;
            </button>
        </div>
    );
};

export default QuantityModal;
