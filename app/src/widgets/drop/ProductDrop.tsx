"use client";

import { ProductDropdownItem } from "@src/components/product/interface";
import { useState, useEffect, useRef } from "react";
import { IoChevronDown } from "react-icons/io5";
import { AdditionalOption } from "../modal/interface";

interface ProductDropProps {
    title: string;
    items: ProductDropdownItem[];
    selected: ProductDropdownItem | null; 
    setSelected: React.Dispatch<React.SetStateAction<any>>;
    type?: "size" | "color" | "additional";
}

const ProductDrop = ({
    title,
    items,
    selected,
    setSelected,
    type = "size",
}: ProductDropProps) => {
    const [open, setOpen] = useState(false);
    const dropRef = useRef<HTMLDivElement>(null);

    const isAdditionalOption = (item: any): item is AdditionalOption => {
        return item && (item as AdditionalOption).name !== undefined;
    };
    
    // 🔧 ProductVariant 타입 가드 추가
    const isProductVariant = (item: any): item is { id: string, colorName: string, stockQuantity: number } => {
        return item && (item as any).colorName !== undefined;
    }

    const getDisplayText = (item: ProductDropdownItem): string => {
        if (isAdditionalOption(item)) {
            return item.name;
        }
        if (typeof item === "string") {
            return item;
        }
        if (isProductVariant(item)) {
            return item.colorName;
        }
        return ""; // Fallback
    };

    const isOutOfStock = (item: ProductDropdownItem): boolean => {
        if (isAdditionalOption(item) || typeof item === "string") {
            return false;
        }
        if (isProductVariant(item)) {
            return item.stockQuantity === 0;
        }
        return false;
    };

    // 🆕 각 아이템에 대한 고유하고 안정적인 key를 생성하는 함수
    const getKey = (item: ProductDropdownItem): string => {
        if (isAdditionalOption(item)) {
            return item.id || item.name;
        }
        if (typeof item === 'string') {
            return item;
        }
        if (isProductVariant(item)) {
            return item.id || item.colorName;
        }
        // Fallback key, ideally should not happen with valid data
        return Math.random().toString(); 
    }

    const handleSelect = (item: ProductDropdownItem) => {
        if (isOutOfStock(item)) {
            return;
        }
        setSelected(item);
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

    const placeholder =
        type === "additional" ? `${title} (선택)` : `${title} (필수)`;

    return (
        <div ref={dropRef} className="font-amstel relative w-full">
            <label className="mb-1 block text-xs font-semibold text-black md:text-sm">
                {title} <span className="text-gray-800">{type === "additional" ? "" : "*"}</span>
            </label>
            <div
                className="relative w-full cursor-pointer border border-gray-300 bg-white px-3 py-2 pr-8 text-xs text-gray-800 md:px-4 md:pr-10 md:text-sm"
                onClick={() => setOpen(!open)}
            >
                {/* ✅ [수정] selected가 객체일 때 getDisplayText를 통해 문자열로 변환하여 표시 */}
                {selected ? getDisplayText(selected as ProductDropdownItem) : placeholder}
                <IoChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm text-black md:right-3" />
            </div>

            {open && (
                <ul className="absolute z-20 max-h-40 w-full overflow-y-auto border border-gray-200 bg-white shadow-md md:max-h-48">
                    {items.map((item: ProductDropdownItem) => {
                        const displayText = getDisplayText(item);
                        const outOfStock = isOutOfStock(item);

                        return (
                            <li
                                // ✅ [수정] index 대신 고유한 key를 사용
                                key={getKey(item)}
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

                                {type === "color" && !isAdditionalOption(item) && (
                                    <span className="text-right">
                                        {outOfStock ? (
                                            <span className="inline-flex items-center rounded-sm bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
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