"use client";

import {
    DropdownItem,
    ProductDropProps,
} from "@/src/components/product/interface";
import { useState, useEffect, useRef } from "react";
import { IoChevronDown } from "react-icons/io5";

const ProductDrop = ({
    title,
    items,
    selected,
    setSelected,
    type = "size",
}: ProductDropProps) => {
    const [open, setOpen] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);

    // 🆕 아이템에서 표시할 텍스트 가져오기
    const getDisplayText = (item: DropdownItem): string => {
        if (typeof item === "string") {
            return item;
        }
        return item.colorName;
    };

    // 🆕 아이템에서 값 가져오기 (selected와 비교용)
    const getValue = (item: DropdownItem): string => {
        if (typeof item === "string") {
            return item;
        }
        return item.colorName;
    };

    // 🆕 품절 여부 확인
    const isOutOfStock = (item: DropdownItem): boolean => {
        if (typeof item === "string") {
            return false; // 사이즈는 품절 없음
        }
        return item.stockQuantity === 0;
    };

    // 🆕 재고량 가져오기
    const getStockQuantity = (item: DropdownItem): number => {
        if (typeof item === "string") {
            return -1; // 사이즈는 재고량 표시 안함
        }
        return item.stockQuantity;
    };

    const handleSelect = (item: DropdownItem) => {
        // 품절인 경우 선택 방지
        if (isOutOfStock(item)) {
            return;
        }

        setSelected(getValue(item));
        setOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                dropRef.current &&
                !dropRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={dropRef} className="font-amstel relative w-full">
            <label className="mb-1 block text-xs font-semibold text-black md:text-sm">
                {title} <span className="text-gray-800">*</span>
            </label>
            <div
                className="relative w-full cursor-pointer border border-gray-300 bg-white px-3 py-2 pr-8 text-xs text-gray-800 md:px-4 md:pr-10 md:text-sm"
                onClick={() => setOpen(!open)}
            >
                {selected || `${title} (필수)`}
                <IoChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-black md:right-3" />
            </div>

            {open && (
                <ul className="absolute z-20 max-h-40 w-full overflow-y-auto border border-gray-200 bg-white shadow-md md:max-h-48">
                    {items.map((item, index) => {
                        const displayText = getDisplayText(item);
                        // const stockQuantity = getStockQuantity(item);
                        const outOfStock = isOutOfStock(item);

                        return (
                            <li
                                key={index}
                                onClick={() => handleSelect(item)}
                                className={`flex items-center justify-between px-3 py-2 text-xs transition-colors md:px-4 md:text-sm ${
                                    outOfStock
                                        ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                        : "cursor-pointer hover:bg-gray-100"
                                } `}
                            >
                                <span
                                    className={outOfStock ? "line-through" : ""}
                                >
                                    {displayText}
                                </span>

                                {type === "color" && (
                                    <span className="text-right">
                                        {outOfStock ? (
                                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                품절
                                            </span>
                                        ) : null}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default ProductDrop;
