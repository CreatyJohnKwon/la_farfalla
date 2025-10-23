import Image from "next/image";
import Link from "next/link";
import DefaultImage from "../../../../../public/images/white_background.png";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Product, SortOption } from "@/src/entities/type/products";
import { Dispatch, SetStateAction } from "react";
import { useUpdateVisibilityMutation } from "@/src/shared/hooks/react-query/useProductQuery";
import { returnProductPath } from "@/src/utils/commonAction";

const SortableRow = ({ 
    index, 
    product, 
    sortOption, 
    stockFilter,
    categoryFilter,
    deleteProduct, 
    returnCategories, 
    setIsOpenUpdateModal, 
    setOnStatus, 
    setEditProduct
}: {
    index: number,
    product: Product;
    sortOption: SortOption;
    stockFilter: "all" | "in_stock" | "out_of_stock";
    categoryFilter: string[];
    deleteProduct: (product: Product) => void;
    returnCategories: (categories: string[]) => string[];
    setIsOpenUpdateModal: Dispatch<SetStateAction<boolean>>;
    setOnStatus: Dispatch<SetStateAction<"update" | "create" | undefined>>;
    setEditProduct: Dispatch<SetStateAction<Product | undefined>>;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `${product._id}` });
    const { mutate: updateVisibility } = useUpdateVisibilityMutation();

    const handleToggleVisibility = () => updateVisibility({ productId: product._id!, visible: !product.visible });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 999 : 'auto',
        position: 'relative' as 'relative',
        background: isDragging ? '#f9fafb' : 'white',
    };

    return (
        <tr ref={setNodeRef} style={style} className="border-b transition-colors hover:bg-gray-50">
            {/* 드래그 핸들 */}
            {sortOption === "none" && stockFilter === "all" && categoryFilter.length === 0 ?
                <td className="w-[5%] px-4 py-3 text-center">
                    <button
                        {...attributes}
                        {...listeners}
                        className="cursor-grab touch-none p-2 text-gray-400 hover:text-gray-700 active:cursor-grabbing"
                        title="순서 변경"
                    >
                    <div className="cursor-grab text-gray-500 touch-none">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="5" r="1"></circle>
                            <circle cx="12" cy="12" r="1"></circle>
                            <circle cx="12" cy="19" r="1"></circle>
                            <circle cx="5" cy="5" r="1"></circle>
                            <circle cx="5" cy="12" r="1"></circle>
                            <circle cx="5" cy="19" r="1"></circle>
                        </svg>
                    </div>
                    </button>
                </td> : null
            }
            {/* 대표 이미지 */}
            <td className="px-4 py-3">
                <Link
                    href={`/products/${returnProductPath(product.title.eg)}/${product._id}`}
                >
                    <Image
                        width={500}
                        height={500}
                        src={
                            product.image[0]
                                ? product
                                        .image[0]
                                : DefaultImage
                        }
                        alt="대표 이미지"
                        className="h-20 w-20 rounded-sm object-cover"
                        priority
                    />
                </Link>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-gray-900 sm:text-sm">
                            {product.title.kr}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                            {product.title.eg}
                        </p>
                    </div>
                    {(sortOption === "latest" ||
                        sortOption ===
                            "oldest") && (
                        <span className="whitespace-nowrap rounded-full bg-purple-100 px-2 py-1 text-xs text-purple-800">
                            #{index + 1}
                        </span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3 text-xs sm:text-sm">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                    {product.categories && product.categories.length > 0
                        ? returnCategories(product.categories).join(",\t")
                            : "All"}
                </span>
            </td>
            <td className="px-4 py-3 text-xs font-medium text-gray-900 sm:text-sm">
                {`${Number(product.price).toLocaleString()}원`}
            </td>
            <td className="px-4 py-3 text-xs font-medium text-gray-900 sm:text-sm">
                {`${product.averageRating ? Number(product.averageRating) : 0}/5`}
            </td>
            <td className="px-4 py-3 text-xs sm:text-sm">
                {Number(product.discount) >
                0 ? (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                        {`${product.discount}%`}
                    </span>
                ) : (
                    <span className="text-gray-400">
                        -
                    </span>
                )}
            </td>
            <td className="px-4 py-3 text-xs sm:text-sm">
                <div className="max-w-full">
                    {product.options &&
                    product.options.length >
                        0 ? (
                        <div className="flex flex-wrap gap-1">
                            {[
                                ...new Set(
                                    product.options.map(
                                        (
                                            option,
                                        ) =>
                                            option.colorName,
                                    ),
                                ),
                            ]
                                .slice(0, 2)
                                .map(
                                    (
                                        color,
                                        idx,
                                    ) => (
                                        <span
                                            key={
                                                idx
                                            }
                                            className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
                                        >
                                            {
                                                color
                                            }
                                        </span>
                                    ),
                                )}
                            {[
                                ...new Set(
                                    product.options.map(
                                        (
                                            option,
                                        ) =>
                                            option.colorName,
                                    ),
                                ),
                            ].length > 2 && (
                                <span className="text-xs text-gray-500">
                                    +
                                    {[
                                        ...new Set(
                                            product.options.map(
                                                (
                                                    option,
                                                ) =>
                                                    option.colorName,
                                            ),
                                        ),
                                    ].length -
                                        2}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400">
                            색상 정보 없음
                        </span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3 text-xs sm:text-sm">
                <div className="max-w-full">
                    {product.size.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {product.size
                                .slice(0, 3)
                                .map(
                                    (
                                        size,
                                        idx,
                                    ) => (
                                        <span
                                            key={
                                                idx
                                            }
                                            className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
                                        >
                                            {
                                                size
                                            }
                                        </span>
                                    ),
                                )}
                            {product.size
                                .length > 3 && (
                                <span className="text-xs text-gray-500">
                                    +
                                    {product
                                        .size
                                        .length -
                                        3}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-xs text-gray-400">
                            사이즈 정보 없음
                        </span>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                {product.quantity === "0" ? (
                    <span className="-ms-1 inline-flex items-center whitespace-nowrap rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                        품절
                    </span>
                ) : (
                    <span className="text-xs font-medium text-gray-900 sm:text-sm">
                        {product.quantity}
                    </span>
                )}
            </td>
            <td className="w-[10%] px-4 py-3 text-center">
                <button
                    onClick={handleToggleVisibility}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        product.visible ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                >
                    <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            product.visible ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                </button>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1">
                    {/* 수정 버튼 */}
                    <button
                        onClick={() => {
                            setIsOpenUpdateModal(true);
                            setOnStatus("update");
                            setEditProduct(product);
                        }}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        title="수정"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                    </button>

                    {/* 삭제 버튼 */}
                    <button
                        onClick={() => {
                            if (
                                confirm(
                                    `"${product.title.kr}" 상품을\n삭제하시겠습니까?`,
                                )
                            ) {
                                deleteProduct(
                                    product,
                                );
                            }
                        }}
                        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-sm text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="삭제"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default SortableRow;