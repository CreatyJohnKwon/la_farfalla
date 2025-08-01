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

    // originalPrice 사용하여 총 가격 계산
    const unitPrice = item.discountPrice || item.originalPrice || 0;
    const totalPrice = item.quantity * unitPrice;

    // 가격 포맷팅
    const formatPrice = (price: number) => {
        return price.toLocaleString();
    };

    return (
        <div className={`flex items-center gap-3 ${custom}`}>
            {/* 수량 조절 버튼들 */}
            <div className="flex items-center gap-1">
                <button
                    className="flex h-6 w-6 items-center justify-center rounded-sm bg-gray-100 text-gray-700 transition-colors duration-150 hover:bg-gray-200"
                    onClick={decrease}
                    disabled={item.quantity <= 1}
                >
                    −
                </button>

                <span className="flex h-6 w-8 min-w-0 items-center justify-center font-medium text-gray-900">
                    {item.quantity}
                </span>

                <button
                    className="flex h-6 w-6 items-center justify-center rounded-sm bg-gray-100 text-gray-700 transition-colors duration-150 hover:bg-gray-200"
                    onClick={increase}
                >
                    +
                </button>
            </div>

            {/* 총 가격 */}
            <div className="font-amstel min-w-0 font-light text-gray-900">
                KRW {formatPrice(totalPrice)}
            </div>

            {/* 삭제 버튼 */}
            <button
                onClick={() => onDelete(id)}
                className="ml-1 flex h-6 w-6 items-center justify-center text-gray-400 transition-colors duration-200 hover:text-red-500"
                aria-label="상품 삭제"
            >
                ×
            </button>
        </div>
    );
};

export default QuantityModal;
