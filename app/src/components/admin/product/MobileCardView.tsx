import { Product } from "@/src/entities/type/products";
import Image from "next/image";
import Link from "next/link";
import DefaultImage from "../../../../../public/images/chill.png";
import useProduct from "@/src/shared/hooks/useProduct";
import { Dispatch, SetStateAction } from "react";
import { returnProductPath } from "@/src/utils/commonAction";

const MobileCardView = ({
    filteredAndSortedProducts,
    setIsOpenUpdateModal,
    setOnStatus,
    setEditProduct
}: {
    filteredAndSortedProducts: Product[],
    setIsOpenUpdateModal: Dispatch<SetStateAction<boolean>>,
    setOnStatus: Dispatch<SetStateAction<"update" | "create" | undefined>>,
    setEditProduct: Dispatch<SetStateAction<Product | undefined>>
}) => {
    const {
        deleteProduct,
        isFetchingNextPage,
        returnCategories,
    } = useProduct();

    return (
        <div className="space-y-3 p-3 sm:space-y-4 sm:p-4 block lg:hidden">
            {filteredAndSortedProducts.map(
                (product: Product, _: number) => (
                    <div
                        key={product._id}
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex gap-3">
                            {/* 상품 이미지 */}
                            <Link
                                href={`/products/${returnProductPath(product.title.eg)}/${product._id}`}
                            >
                                <Image
                                    width={300}
                                    height={300}
                                    src={
                                        product.image[0]
                                            ? product.image[0]
                                            : DefaultImage
                                    }
                                    alt="상품 이미지"
                                    className="h-20 w-20 flex-shrink-0 rounded-sm object-cover"
                                    priority
                                />
                            </Link>

                            {/* 상품 정보 */}
                            <div className="min-w-0 flex-1">
                                <div className="mb-2">
                                    <h3 className="truncate text-sm font-medium text-gray-900">
                                        {product.title.kr}
                                    </h3>
                                    <p className="truncate text-xs text-gray-500">
                                        {product.title.eg}
                                    </p>
                                </div>

                                {/* 가격 및 할인 */}
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900">
                                        {`${Number(product.price).toLocaleString()}원`}
                                    </span>
                                    {Number(product.discount) >
                                        0 && (
                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                            {`${product.discount}%`}
                                        </span>
                                    )}
                                </div>

                                {/* 카테고리 및 재고 */}
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                                        {product.categories && product.categories.length > 0
                                            ? returnCategories(product.categories).join(",\t")
                                                : "All"}
                                    </span>
                                    {product.quantity ===
                                    "0" ? (
                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                            품절
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-600">
                                            재고:{" "}
                                            {product.quantity}
                                        </span>
                                    )}
                                </div>

                                {/* 색상 및 사이즈 */}
                                <div className="mb-3 space-y-1">
                                    {product.options &&
                                        product.options.length >
                                            0 && (
                                            <div className="flex flex-wrap gap-1">
                                                <span className="text-xs text-gray-500">
                                                    색상:
                                                </span>
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
                                                                className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
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
                                                ].length >
                                                    2 && (
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
                                                        ]
                                                            .length -
                                                            2}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    {product.size.length >
                                        0 && (
                                        <div className="flex flex-wrap gap-1">
                                            <span className="text-xs text-gray-500">
                                                사이즈:
                                            </span>
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
                                                            className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800"
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
                                    )}
                                </div>

                                {/* 액션 버튼 */}
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => {
                                            setIsOpenUpdateModal(true);
                                            setOnStatus("update");
                                            setEditProduct(product);
                                        }}
                                        className="flex h-10 w-10 items-center justify-center rounded-sm text-gray-400 transition-colors hover:text-blue-600"
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
                                        className="flex h-10 w-10 items-center justify-center rounded-sm text-gray-400 transition-colors hover:text-red-600"
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
                            </div>
                        </div>
                    </div>
                ),
            )}

            {/* 스켈레톤 로딩 (모바일) */}
            {isFetchingNextPage && (
                <div className="space-y-3">
                    {[...Array(3)].map((_, index) => (
                        <div
                            key={`mobile-skeleton-${index}`}
                            className="animate-fade-in rounded-lg border border-gray-200 bg-white p-4"
                        >
                            <div className="flex gap-3">
                                <div className="h-20 w-20 rounded-sm bg-gray-200" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                                    <div className="h-3 w-1/2 rounded bg-gray-200" />
                                    <div className="flex gap-2">
                                        <div className="h-5 w-12 rounded-full bg-gray-200" />
                                        <div className="h-5 w-12 rounded-full bg-gray-200" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MobileCardView;