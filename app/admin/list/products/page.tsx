"use client";

import { Product } from "@/src/entities/type/interfaces";
import {
    useDeleteProductMutation,
    useProductListQuery,
    useSeasonQuery,
} from "@/src/shared/hooks/react-query/useProductQuery";
import Image from "next/image";
import DefaultImage from "../../../../public/images/chill.png";
import { useState } from "react";
import UpdateProductModal from "@/src/widgets/modal/UpdateProductModal";

const Products = () => {
    const {
        data: products,
        isLoading: isProductListLoading,
        refetch,
    } = useProductListQuery();
    const [isOpenUpdateModal, setIsOpenUpdateModal] = useState<boolean>(false);
    const [onStatus, setOnStatus] = useState<"create" | "update">();
    const [editProduct, setEditProduct] = useState<Product>();
    const { data: season, isLoading: isSeasonLoading } = useSeasonQuery();
    const { mutateAsync: deleteProduct } = useDeleteProductMutation();

    if (isProductListLoading) return <div>Loading...</div>;
    if (!products) return <div>상품 리스트를 불러올 수 없습니다.</div>;

    const onClose = () => setIsOpenUpdateModal(false);
    const onOpen = () => setIsOpenUpdateModal(true);

    const returnSeason = (seasonId: string): string =>
        season?.find((item) => item._id === seasonId)?.title || "";

    return (
        !isSeasonLoading && (
            <div className="w-full max-w-full overflow-x-auto border font-pretendard sm:p-16 md:overflow-x-visible">
                <div className="ms-5 mt-20 flex h-8 w-full items-center justify-between sm:ms-0">
                    {/* 새로고침 버튼 */}
                    <button
                        onClick={() => refetch()}
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

                    <div className="flex h-full gap-4">
                        {/* 상품 등록하기 버튼 */}
                        <button
                            onClick={() => {
                                // onOpenSeasonModal();
                            }}
                            className={`flex h-full w-auto items-center justify-center rounded border border-gray-300 bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800`}
                        >
                            시즌 관리
                        </button>

                        {/* 상품 등록하기 버튼 */}
                        <button
                            onClick={() => {
                                onOpen();
                                setOnStatus("create");
                            }}
                            className={`flex h-full w-auto items-center justify-center rounded border border-gray-300 bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800`}
                        >
                            상품 등록하기
                        </button>
                    </div>
                </div>

                <table className="ms-5 mt-5 h-full w-full min-w-[700px] table-auto text-left text-sm sm:ms-0">
                    <thead>
                        <tr className="border-b text-gray-600">
                            <th className="w-[10%] px-2 py-2 text-xs sm:text-sm md:px-4">
                                대표 이미지
                            </th>
                            <th className="w-[15%] px-2 py-2 text-xs sm:text-sm md:px-4">
                                상품명
                            </th>
                            <th className="w-[10%] px-2 py-2 text-xs sm:text-sm md:px-4">
                                시즌
                            </th>
                            <th className="w-[10%] px-2 py-2 text-xs sm:text-sm md:px-4">
                                가격
                            </th>
                            <th className="w-[8%] px-2 py-2 text-xs sm:text-sm md:px-4">
                                할인율
                            </th>
                            <th className="w-[20%] px-2 py-2 text-xs sm:text-sm md:px-4">
                                색상
                            </th>
                            <th className="w-[10%] px-2 py-2 text-xs sm:text-sm md:px-4">
                                사이즈
                            </th>
                            <th className="w-[8%] px-2 py-2 text-xs sm:text-sm md:px-4">
                                수정/삭제
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.map((product: Product) => (
                            <tr
                                key={product._id}
                                className="border-b hover:bg-gray-50"
                            >
                                <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
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
                                </td>
                                <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                    <div className="w-[80%]">
                                        <p className="truncate">
                                            {product.title.kr}
                                        </p>
                                        <p className="truncate">
                                            {product.title.eg}
                                        </p>
                                    </div>
                                </td>
                                <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                    {returnSeason(product.seasonName)}
                                </td>
                                <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                    {`${product.price}원`}
                                </td>
                                <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                    {`${product.discount}%`}
                                </td>
                                <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                    {product.colors.length > 0
                                        ? product.colors.join(", ")
                                        : "색상 정보 없음"}
                                </td>
                                <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                    {product.size.length > 0
                                        ? product.size.join(", ")
                                        : "사이즈 정보 없음"}
                                </td>
                                <td className="px-2 py-2 text-xs sm:text-sm md:px-4">
                                    <button
                                        onClick={() => {
                                            onOpen();
                                            setOnStatus("update");
                                            setEditProduct(product);
                                        }}
                                        className="mr-2 text-gray-600 hover:underline"
                                    >
                                        수정
                                    </button>
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
                                        className="text-red-600 hover:underline"
                                    >
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {isOpenUpdateModal && (
                    <UpdateProductModal
                        onClose={onClose}
                        season={season}
                        product={editProduct}
                        mode={onStatus}
                    />
                )}
                {/* {isOpenUpdateSeasonModal && (
                    <UpdateSeasonModal
                        onClose={onClose}
                        season={season}
                    />
                )} */}
            </div>
        )
    );
};

export default Products;
