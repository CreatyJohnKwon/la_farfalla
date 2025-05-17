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
        <div className={`${custom} `}>
            {/* 상품명 + 옵션 표기 */}
            <span>{`${item.size} - ${item.color}`}</span>

            {/* 수량 */}
            <div className="flex items-center justify-center gap-2">
                <div className="flex aspect-square w-4 items-center justify-center bg-gray-200 text-center text-xs c_md:w-10 c_md:text-sm">
                    {item.quantity}
                </div>
                <button
                    className="flex aspect-square w-4 items-center justify-center bg-gray-200 text-center text-xs transition hover:bg-gray-300 active:scale-95 c_md:w-10 c_md:text-sm"
                    onClick={increase}
                >
                    +
                </button>
                <button
                    className="flex aspect-square w-4 items-center justify-center bg-gray-200 text-center text-xs transition hover:bg-gray-300 active:scale-95 c_md:w-10 c_md:text-sm"
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
                className="right-5 top-3 ms-2 font-thin text-black sm:m-0"
            >
                &times;
            </button>
        </div>
    );
};

export default QuantityModal;
