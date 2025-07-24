"use client";

import { useDeleteProductMutation } from "@/src/shared/hooks/react-query/useProductQuery";
import Image from "next/image";
import DefaultImage from "../../../../public/images/chill.png";
import { useState } from "react";
import UpdateProductModal from "@/src/widgets/modal/UpdateProduct/UpdateProductModal";
import UpdateSeasonModal from "@/src/widgets/modal/UpdateSeasonModal";
import Link from "next/link";
import { Product } from "@/src/components/product/interface";
import useProduct from "@/src/shared/hooks/useProduct";

const Products = () => {
    const [isOpenUpdateModal, setIsOpenUpdateModal] = useState<boolean>(false);
    const [isOpenUpdateSeasonModal, setIsOpenUpdateSeasonModal] =
        useState<boolean>(false);
    const [onStatus, setOnStatus] = useState<"create" | "update">();
    const [editProduct, setEditProduct] = useState<Product>();
    const { 
        deleteProduct,    
        handleProductListScroll,
        useRefetchProducts,
        products,
        productsLoading,
        filteredProducts
     } = useProduct();

    if (productsLoading) return <div>Loading...</div>;
    if (!products) return <div>상품 리스트를 불러올 수 없습니다.</div>;

    return (
        <div className="w-screen max-w-full overflow-x-auto border pt-16 font-pretendard sm:p-16 md:overflow-x-visible">
            <div className="ms-5 mt-[5vh] flex h-8 w-full items-center gap-6 sm:ms-0 sm:justify-between">
                <div className="flex items-center gap-4 h-full">
                    <h1 className="text-xl font-semibold text-gray-800">
                        상품 관리
                    </h1>
                    {/* 새로고침 버튼 */}
                    <button
                        onClick={() => useRefetchProducts()}
                        className="flex h-full w-8 items-center justify-center rounded border border-gray-300 bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800"
                        title="새로고침"
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
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                    </button>
                </div>

                <div className="flex h-full gap-4">
                    {/* 상품 등록하기 버튼 */}
                    <button
                        onClick={() => {
                            setIsOpenUpdateSeasonModal(true);
                        }}
                        className={`flex h-full w-auto items-center justify-center rounded border border-gray-300 bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800`}
                    >
                        시즌 관리
                    </button>

                    {/* 상품 등록하기 버튼 */}
                    <button
                        onClick={() => {
                            setIsOpenUpdateModal(true);
                            setOnStatus("create");
                        }}
                        className={`flex h-full w-auto items-center justify-center rounded border border-gray-300 bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800`}
                    >
                        상품 등록하기
                    </button>
                </div>
            </div>

            <div className="h-full overflow-y-auto mt-10 min-w-[700px]" onScroll={handleProductListScroll}>
                <table className="ms-5 h-full w-full table-auto text-left text-sm sm:ms-0">
                    <thead>
                        <tr className="border-b text-gray-600 whitespace-nowrap">
                            <th className="w-[10%] px-2 py-2 text-xs sm:text-sm md:px-4">
                                대표 이미지
                            </th>
                            <th className="w-[20%] px-2 py-2 text-xs sm:text-sm md:px-4">
                                상품명
                            </th>
                            <th className="w-[10%] px-2 py-2 text-xs sm:text-sm md:px-4">
                                시즌
                            </th>
                            <th className="w-[10%] px-2 py-2 text-xs sm:text-sm md:px-4">
                                가격
                            </th>
                            <th className="w-[10%] px-2 py-2 text-xs sm:text-sm md:px-4">
                                할인율
                            </th>
                            <th className="w-[15%] px-2 py-2 text-xs sm:text-sm md:px-4">
                                색상
                            </th>
                            <th className="w-[15%] px-2 py-2 text-xs sm:text-sm md:px-4">
                                사이즈
                            </th>
                            <th className="w-[5%] px-2 py-2 text-xs sm:text-sm md:px-4">
                                총 수량
                            </th>
                            <th className="w-[10%] whitespace-nowrap px-2 py-2 text-xs sm:text-sm md:px-4">
                                수정/삭제
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredProducts.map((product: Product) => (
                            <tr
                                key={product._id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                    <Link href={`/products/${product._id}`}>
                                        <Image
                                            width={500}
                                            height={500}
                                            src={
                                                product.image[0]
                                                    ? product.image[0]
                                                    : DefaultImage
                                            }
                                            alt="대표 이미지"
                                            className="h-20 w-20 object-cover"
                                        />
                                    </Link>
                                </td>
                                <td className="text-xs sm:text-sm">
                                    <div className="w-[80%]">
                                        <p className="truncate">
                                            {product.title.kr}
                                        </p>
                                        <p className="truncate">
                                            {product.title.eg}
                                        </p>
                                    </div>
                                </td>
                                <td className="text-xs sm:text-sm">
                                    {product.seasonName !== ""
                                        ? product.seasonName
                                        : "All"}
                                </td>
                                <td className="text-xs sm:text-sm">
                                    {`${Number(product.price).toLocaleString()}원`}
                                </td>
                                <td className="text-xs sm:text-sm">
                                    {`${product.discount}%`}
                                </td>
                                <td className="text-xs sm:text-sm">
                                    {product.options && product.options.length > 0
                                        ? [
                                            ...new Set(
                                                product.options.map(
                                                    (option) => option.colorName,
                                                ),
                                            ),
                                        ].join(", ")
                                        : "색상 정보 없음"}
                                </td>
                                <td className="text-xs sm:text-sm">
                                    {product.size.length > 0
                                        ? product.size.join(", ")
                                        : "사이즈 정보 없음"}
                                </td>
                                <td
                                    className={`text-xs sm:text-sm ${product.quantity === "0" ? "text-red-600" : "text-black"}`}
                                >
                                    {product.quantity === "0"
                                        ? "품절"
                                        : product.quantity}
                                </td>
                                <td className="text-xs sm:text-sm">
                                    <div className="flex items-center gap-2">
                                        {/* 수정 버튼 */}
                                        <button
                                            onClick={() => {
                                                setIsOpenUpdateModal(true);
                                                setOnStatus("update");
                                                setEditProduct(product);
                                            }}
                                            className="rounded-md p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
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
                                                    deleteProduct(product);
                                                }
                                            }}
                                            className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
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
                        ))}
                    </tbody>
                </table>
            </div>

            {isOpenUpdateModal && (
                <UpdateProductModal
                    onClose={() => setIsOpenUpdateModal(false)}
                    product={editProduct}
                    mode={onStatus}
                />
            )}
            {isOpenUpdateSeasonModal && (
                <UpdateSeasonModal
                    onClose={() => setIsOpenUpdateSeasonModal(false)}
                />
            )}
        </div>
    );
};

export default Products;
