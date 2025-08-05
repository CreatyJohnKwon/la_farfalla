"use client";

import Image from "next/image";
import DefaultImage from "../../../../public/images/chill.png";
import { useState, useMemo } from "react";
import UpdateProductModal from "@/src/widgets/modal/UpdateProduct/UpdateProductModal";
import UpdateSeasonModal from "@/src/widgets/modal/UpdateSeasonModal";
import Link from "next/link";
import { Product } from "@/src/components/product/interface";
import useProduct from "@/src/shared/hooks/useProduct";

type SortOption =
    | "none"
    | "latest"
    | "oldest"
    | "name_asc"
    | "name_desc"
    | "price_asc"
    | "price_desc";

const Products = () => {
    const [isOpenUpdateModal, setIsOpenUpdateModal] = useState<boolean>(false);
    const [isOpenUpdateSeasonModal, setIsOpenUpdateSeasonModal] =
        useState<boolean>(false);
    const [onStatus, setOnStatus] = useState<"create" | "update">();
    const [editProduct, setEditProduct] = useState<Product>();

    // 필터 상태
    const [seasonFilter, setSeasonFilter] = useState<string>("all");
    const [sortOption, setSortOption] = useState<SortOption>("none");
    const [stockFilter, setStockFilter] = useState<
        "all" | "in_stock" | "out_of_stock"
    >("all");

    const {
        deleteProduct,
        handleProductListScroll,
        useRefetchProducts,
        products,
        productsLoading,
        filteredProducts: originalFilteredProducts,
        isFetchingNextPage,
    } = useProduct();

    // 고유한 시즌 목록 추출
    const uniqueSeasons = useMemo(() => {
        if (!originalFilteredProducts) return [];
        const seasons = [
            ...new Set(
                originalFilteredProducts.map((product) =>
                    product.seasonName && product.seasonName !== ""
                        ? product.seasonName
                        : "All",
                ),
            ),
        ];
        return seasons.sort();
    }, [originalFilteredProducts]);

    // 필터링된 상품 목록
    const filteredAndSortedProducts = useMemo(() => {
        if (!originalFilteredProducts) return [];

        let result = [...originalFilteredProducts];

        // 시즌 필터링
        if (seasonFilter !== "all") {
            result = result.filter((product) => {
                const productSeason =
                    product.seasonName && product.seasonName !== ""
                        ? product.seasonName
                        : "All";
                return productSeason === seasonFilter;
            });
        }

        // 재고 필터링
        if (stockFilter !== "all") {
            if (stockFilter === "in_stock") {
                result = result.filter((product) => product.quantity !== "0");
            } else if (stockFilter === "out_of_stock") {
                result = result.filter((product) => product.quantity === "0");
            }
        }

        // 정렬
        switch (sortOption) {
            case "latest":
                result.sort(
                    (a, b) =>
                        new Date(b.createdAt || 0).getTime() -
                        new Date(a.createdAt || 0).getTime(),
                );
                break;
            case "oldest":
                result.sort(
                    (a, b) =>
                        new Date(a.createdAt || 0).getTime() -
                        new Date(b.createdAt || 0).getTime(),
                );
                break;
            case "name_asc":
                result.sort((a, b) =>
                    a.title.kr.localeCompare(b.title.kr, "ko-KR"),
                );
                break;
            case "name_desc":
                result.sort((a, b) =>
                    b.title.kr.localeCompare(a.title.kr, "ko-KR"),
                );
                break;
            case "price_asc":
                result.sort((a, b) => Number(a.price) - Number(b.price));
                break;
            case "price_desc":
                result.sort((a, b) => Number(b.price) - Number(a.price));
                break;
            default:
                // "none"인 경우 원본 순서 유지
                break;
        }

        return result;
    }, [originalFilteredProducts, seasonFilter, sortOption, stockFilter]);

    // 필터 초기화
    const resetFilters = () => {
        setSeasonFilter("all");
        setSortOption("none");
        setStockFilter("all");
    };

    if (productsLoading) return <div>Loading...</div>;
    if (!products) return <div>상품 리스트를 불러올 수 없습니다.</div>;

    return (
        <div className="w-full max-w-full p-4 font-pretendard sm:p-6 lg:p-16">
            {/* 헤더 */}
            <div className="mb-6 mt-4 sm:mt-8 lg:mt-[5vh]">
                <div className="flex flex-col gap-4">
                    {/* 타이틀과 버튼들 */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl">
                                상품 관리
                            </h1>
                            <button
                                onClick={() => useRefetchProducts()}
                                className="flex h-9 w-9 items-center justify-center rounded border border-gray-300 bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800 sm:h-10 sm:w-10"
                                title="새로고침"
                            >
                                <svg
                                    className="h-4 w-4 sm:h-5 sm:w-5"
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

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsOpenUpdateSeasonModal(true);
                                }}
                                className="flex h-10 items-center justify-center whitespace-nowrap rounded border border-gray-300 bg-gray-100 px-4 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800 sm:h-12"
                            >
                                시즌 관리
                            </button>

                            <button
                                onClick={() => {
                                    setIsOpenUpdateModal(true);
                                    setOnStatus("create");
                                }}
                                className="flex h-10 items-center justify-center whitespace-nowrap rounded border border-gray-300 bg-gray-100 px-4 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-800 sm:h-12"
                            >
                                상품 등록하기
                            </button>
                        </div>
                    </div>

                    {/* 필터 옵션 */}
                    <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex flex-col gap-4">
                            {/* 첫 번째 줄: 시즌, 재고 상태 */}
                            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                                <div className="flex items-center gap-2">
                                    <span className="whitespace-nowrap text-sm text-gray-600">
                                        시즌:
                                    </span>
                                    <select
                                        value={seasonFilter}
                                        onChange={(e) =>
                                            setSeasonFilter(e.target.value)
                                        }
                                        className="min-h-[44px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">전체 시즌</option>
                                        {uniqueSeasons.map((season) => (
                                            <option key={season} value={season}>
                                                {season}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="whitespace-nowrap text-sm text-gray-600">
                                        재고:
                                    </span>
                                    <select
                                        value={stockFilter}
                                        onChange={(e) =>
                                            setStockFilter(
                                                e.target.value as any,
                                            )
                                        }
                                        className="min-h-[44px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="all">전체</option>
                                        <option value="in_stock">
                                            재고 있음
                                        </option>
                                        <option value="out_of_stock">
                                            품절
                                        </option>
                                    </select>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="whitespace-nowrap text-sm text-gray-600">
                                        정렬:
                                    </span>
                                    <select
                                        value={sortOption}
                                        onChange={(e) =>
                                            setSortOption(
                                                e.target.value as SortOption,
                                            )
                                        }
                                        className="min-h-[44px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="none">기본 순서</option>
                                        <option value="latest">
                                            최근 등록순
                                        </option>
                                        <option value="oldest">
                                            오래된 등록순
                                        </option>
                                        <option value="name_asc">
                                            상품명 ㄱ-ㅎ 순
                                        </option>
                                        <option value="name_desc">
                                            상품명 ㅎ-ㄱ 순
                                        </option>
                                        <option value="price_asc">
                                            가격 낮은 순
                                        </option>
                                        <option value="price_desc">
                                            가격 높은 순
                                        </option>
                                    </select>
                                </div>

                                {(seasonFilter !== "all" ||
                                    sortOption !== "none" ||
                                    stockFilter !== "all") && (
                                    <button
                                        onClick={resetFilters}
                                        className="min-h-[44px] whitespace-nowrap rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                                    >
                                        필터 초기화
                                    </button>
                                )}
                            </div>

                            {/* 결과 정보 */}
                            <div className="text-sm text-gray-600">
                                총{" "}
                                <span className="font-medium text-blue-600">
                                    {filteredAndSortedProducts.length}
                                </span>
                                개 상품
                                {originalFilteredProducts &&
                                    filteredAndSortedProducts.length !==
                                        originalFilteredProducts.length && (
                                        <span className="ml-1 text-gray-500">
                                            (전체{" "}
                                            {originalFilteredProducts.length}개
                                            중)
                                        </span>
                                    )}
                            </div>

                            {/* 활성 필터 태그 */}
                            {(seasonFilter !== "all" ||
                                sortOption !== "none" ||
                                stockFilter !== "all") && (
                                <div className="flex flex-wrap gap-2">
                                    {seasonFilter !== "all" && (
                                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                            시즌: {seasonFilter}
                                            <button
                                                onClick={() =>
                                                    setSeasonFilter("all")
                                                }
                                                className="ml-1 hover:text-blue-600"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {stockFilter !== "all" && (
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                            재고:{" "}
                                            {stockFilter === "in_stock"
                                                ? "재고 있음"
                                                : "품절"}
                                            <button
                                                onClick={() =>
                                                    setStockFilter("all")
                                                }
                                                className="ml-1 hover:text-green-600"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {sortOption !== "none" && (
                                        <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                                            정렬:{" "}
                                            {sortOption === "latest"
                                                ? "최근 등록순"
                                                : sortOption === "oldest"
                                                  ? "오래된 등록순"
                                                  : sortOption === "name_asc"
                                                    ? "상품명 ㄱ-ㅎ 순"
                                                    : sortOption === "name_desc"
                                                      ? "상품명 ㅎ-ㄱ 순"
                                                      : sortOption ===
                                                          "price_asc"
                                                        ? "가격 낮은 순"
                                                        : "가격 높은 순"}
                                            <button
                                                onClick={() =>
                                                    setSortOption("none")
                                                }
                                                className="ml-1 hover:text-purple-600"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 테이블 컨테이너 */}
            <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                <div
                    className="max-h-[70vh] overflow-x-auto overflow-y-auto"
                    onScroll={handleProductListScroll}
                >
                    <table className="w-full min-w-[700px] table-fixed text-left text-sm">
                        <thead>
                            <tr className="sticky top-0 whitespace-nowrap border-b bg-gray-50 text-gray-600">
                                <th className="w-[10%] px-4 py-3 text-xs font-medium sm:text-sm">
                                    대표 이미지
                                </th>
                                <th className="w-[20%] px-4 py-3 text-xs font-medium sm:text-sm">
                                    <div className="flex items-center gap-1">
                                        상품명
                                        {(sortOption === "name_asc" ||
                                            sortOption === "name_desc") && (
                                            <svg
                                                className={`h-4 w-4 ${sortOption === "name_asc" ? "rotate-0" : "rotate-180"}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 15l7-7 7 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </th>
                                <th className="w-[10%] px-4 py-3 text-xs font-medium sm:text-sm">
                                    시즌
                                </th>
                                <th className="w-[10%] px-4 py-3 text-xs font-medium sm:text-sm">
                                    <div className="flex items-center gap-1">
                                        가격
                                        {(sortOption === "price_asc" ||
                                            sortOption === "price_desc") && (
                                            <svg
                                                className={`h-4 w-4 ${sortOption === "price_asc" ? "rotate-0" : "rotate-180"}`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 15l7-7 7 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </th>
                                <th className="w-[10%] px-4 py-3 text-xs font-medium sm:text-sm">
                                    할인율
                                </th>
                                <th className="w-[15%] px-4 py-3 text-xs font-medium sm:text-sm">
                                    색상
                                </th>
                                <th className="w-[15%] px-4 py-3 text-xs font-medium sm:text-sm">
                                    사이즈
                                </th>
                                <th className="w-[5%] px-4 py-3 text-xs font-medium sm:text-sm">
                                    총 수량
                                </th>
                                <th className="w-[10%] whitespace-nowrap px-4 py-3 text-xs font-medium sm:text-sm">
                                    수정/삭제
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredAndSortedProducts.map(
                                (product: Product, index) => (
                                    <tr
                                        key={product._id}
                                        className="border-b transition-colors hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/products/${product._id}`}
                                            >
                                                <Image
                                                    width={500}
                                                    height={500}
                                                    src={
                                                        product.image[0]
                                                            ? product.image[0]
                                                            : DefaultImage
                                                    }
                                                    alt="대표 이미지"
                                                    className="h-20 w-20 rounded-md object-cover"
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
                                                {product.seasonName !== ""
                                                    ? product.seasonName
                                                    : "All"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs font-medium text-gray-900 sm:text-sm">
                                            {`${Number(product.price).toLocaleString()}원`}
                                        </td>
                                        <td className="px-4 py-3 text-xs sm:text-sm">
                                            {Number(product.discount) > 0 ? (
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
                                                product.options.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {[
                                                            ...new Set(
                                                                product.options.map(
                                                                    (option) =>
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
                                                                        {color}
                                                                    </span>
                                                                ),
                                                            )}
                                                        {[
                                                            ...new Set(
                                                                product.options.map(
                                                                    (option) =>
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
                                                                ].length - 2}
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
                                                                (size, idx) => (
                                                                    <span
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
                                                                    >
                                                                        {size}
                                                                    </span>
                                                                ),
                                                            )}
                                                        {product.size.length >
                                                            3 && (
                                                            <span className="text-xs text-gray-500">
                                                                +
                                                                {product.size
                                                                    .length - 3}
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
                                                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                                    품절
                                                </span>
                                            ) : (
                                                <span className="text-xs font-medium text-gray-900 sm:text-sm">
                                                    {product.quantity}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* 수정 버튼 */}
                                                <button
                                                    onClick={() => {
                                                        setIsOpenUpdateModal(
                                                            true,
                                                        );
                                                        setOnStatus("update");
                                                        setEditProduct(product);
                                                    }}
                                                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
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
                                                    className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
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
                                ),
                            )}

                            {isFetchingNextPage && (
                                <>
                                    {[...Array(3)].map((_, index) => (
                                        <tr
                                            key={`skeleton-${index}`}
                                            className="animate-pulse border-b"
                                        >
                                            <td className="px-4 py-3">
                                                <div className="h-20 w-20 rounded-md bg-gray-200" />
                                            </td>
                                            <td colSpan={8}>
                                                <div className="space-y-2">
                                                    <div className="h-4 w-[80%] rounded bg-gray-200" />
                                                    <div className="h-4 w-[60%] rounded bg-gray-200" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 빈 상태 */}
                {!productsLoading && filteredAndSortedProducts.length === 0 && (
                    <div className="py-12 text-center text-gray-500">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            {seasonFilter !== "all" ||
                            sortOption !== "none" ||
                            stockFilter !== "all"
                                ? "필터 조건에 맞는 상품이 없습니다"
                                : "상품이 없습니다"}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {seasonFilter !== "all" ||
                            sortOption !== "none" ||
                            stockFilter !== "all"
                                ? "다른 필터 조건을 시도해보세요."
                                : "새로운 상품을 등록해보세요."}
                        </p>
                    </div>
                )}
            </div>

            {/* 모달들 */}
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
