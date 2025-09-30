"use client";

import { useState, useMemo, useEffect } from "react";
import UpdateCategoryModal from "@/src/widgets/modal/category/UpdateCategoryModal";
import { Product, SortOption } from "@src/entities/type/products";
import useProduct from "@src/shared/hooks/useProduct";
import UpdateProductModal from "@/src/widgets/modal/product/UpdateProductModal";
import MobileCardView from "@/src/components/admin/product/MobileCardView";
import PCSkeleton from "@/src/components/admin/product/PCSkeleton";
import PCTableView from "@/src/components/admin/product/PCTableView";
import AdminProductListHeader from "@/src/components/admin/product/AdminProductListHeader";

const Products = () => {
    const [isOpenUpdateModal, setIsOpenUpdateModal] = useState<boolean>(false);
    const [isOpenUpdateCategoryModal, setIsOpenUpdateCategoryModal] = useState<boolean>(false);
    const [onStatus, setOnStatus] = useState<"create" | "update">();
    const [editProduct, setEditProduct] = useState<Product>();

    // 필터 상태
    const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
    const [sortOption, setSortOption] = useState<SortOption>("none");
    const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "out_of_stock">("all");
    const [viewProducts, setViewProducts] = useState<Product[]>([]);

    const {
        handleProductListScroll,
        products,
        productsLoading,
        isFetchingNextPage,
    } = useProduct();

    const sourceProducts = useMemo(() => {
        if (!products?.pages) return [];
        return products.pages.flatMap(page => page.data);
    }, [products]);

    const filteredProducts = useMemo(() => {
        if (!products?.pages) return [];
        const allProducts = products.pages.flatMap(page => page.data);
        return allProducts;
    }, [products]);

    // 고유한 카테고리 목록 추출
    const uniqueCategory = useMemo(() => {
        if (!sourceProducts) return [];
        const allCategories = sourceProducts.flatMap(p => p.categories || []);
        return [...new Set(allCategories)].sort();
    }, [sourceProducts]);

    // 필터링된 상품 목록
    const filteredAndSortedProducts = useMemo(() => {
        if (!filteredProducts) return [];
        let result = [...filteredProducts];

        // [수정] 카테고리 필터링: 선택된 카테고리가 하나라도 상품에 포함되면 true
        if (categoryFilter.length > 0) {
            result = result.filter((product) =>
                product.categories.some(cat => categoryFilter.includes(cat))
            );
        }

        // 재고 필터링 (기존 로직 유지)
        if (stockFilter !== "all") {
            if (stockFilter === "in_stock") {
                result = result.filter((product) => product.quantity !== "0");
            } else if (stockFilter === "out_of_stock") {
                result = result.filter((product) => product.quantity === "0");
            }
        }

        // 정렬 (기존 로직 유지)
        switch (sortOption) {
            case "latest":
                result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                break;
            case "oldest":
                result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
                break;
            case "name_asc":
                result.sort((a, b) => a.title.kr.localeCompare(b.title.kr, "ko-KR"));
                break;
            case "name_desc":
                result.sort((a, b) => b.title.kr.localeCompare(a.title.kr, "ko-KR"));
                break;
            case "price_asc":
                result.sort((a, b) => Number(a.price) - Number(b.price));
                break;
            case "price_desc":
                result.sort((a, b) => Number(b.price) - Number(a.price));
                break;
            default:
                break;
        }

        return result;
    }, [filteredProducts, categoryFilter, sortOption, stockFilter]);

    const handleCategoryToggle = (categoryId: string) => {
        setCategoryFilter((prev) => {
            if (prev.includes(categoryId)) {
                return prev.filter((c) => c !== categoryId);
            } else {
                return [...prev, categoryId];
            }
        });
    };

    // 필터 초기화
    const resetFilters = () => {
        setCategoryFilter([]);
        setSortOption("none");
        setStockFilter("all");
    };

    useEffect(() => {
        if (!sourceProducts) return;

        let result = [...sourceProducts];

        // 카테고리 필터링
        if (categoryFilter.length > 0) {
            result = result.filter((product) =>
                product.categories.some(cat => categoryFilter.includes(cat))
            );
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
            case "none": // '수동 정렬'일 경우 index 순서대로 정렬
                result.sort((a, b) => (a.index || 0) - (b.index || 0));
                break;
            case "latest":
                result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
                break;
            case "oldest":
                result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
                break;
            case "name_asc":
                result.sort((a, b) => a.title.kr.localeCompare(b.title.kr, "ko-KR"));
                break;
            case "name_desc":
                result.sort((a, b) => b.title.kr.localeCompare(a.title.kr, "ko-KR"));
                break;
            case "price_asc":
                result.sort((a, b) => Number(a.price) - Number(b.price));
                break;
            case "price_desc":
                result.sort((a, b) => Number(b.price) - Number(a.price));
                break;
            default:
                result.sort((a, b) => (a.index || 0) - (b.index || 0));
                break;
        }

        setViewProducts(result);
    }, [sourceProducts, categoryFilter, sortOption, stockFilter]);

    if (productsLoading) return <div>Loading...</div>;
    if (!products) return <div>상품 리스트를 불러올 수 없습니다.</div>;

    return (
        <div className="w-full max-w-full p-3 font-pretendard sm:p-6 lg:p-10">
            {/* 헤더 */}
            <AdminProductListHeader 
                sortOption={sortOption}
                setSortOption={setSortOption}
                stockFilter={stockFilter}
                setStockFilter={setStockFilter}
                resetFilters={resetFilters}
                categoryFilter={categoryFilter}
                uniqueCategory={uniqueCategory}
                setOnStatus={setOnStatus}
                setIsOpenUpdateModal={setIsOpenUpdateModal}
                setIsOpenUpdateCategoryModal={setIsOpenUpdateCategoryModal}
                filteredProducts={filteredProducts}
                filteredAndSortedProducts={filteredAndSortedProducts}
                handleCategoryToggle={handleCategoryToggle}
            />

            {/* 상품 리스트 */}
            <div className="overflow-hidden rounded-lg bg-white">
                <div
                    className="max-h-[70vh] overflow-y-auto"
                    onScroll={handleProductListScroll}
                >
                    {/* 데스크톱 테이블 뷰 */}
                    <PCTableView 
                        categoryFilter={categoryFilter}
                        stockFilter={stockFilter}
                        sortOption={sortOption}
                        products={viewProducts}
                        setProducts={setViewProducts}
                        setIsOpenUpdateModal={setIsOpenUpdateModal}
                        setOnStatus={setOnStatus}
                        setEditProduct={setEditProduct}
                    />

                    {/* 모바일 카드 뷰 */}
                    <MobileCardView
                        filteredAndSortedProducts={filteredAndSortedProducts}
                        setIsOpenUpdateModal={setIsOpenUpdateModal}
                        setOnStatus={setOnStatus}
                        setEditProduct={setEditProduct}
                    />

                    {/* 데스크톱 스켈레톤 로딩 */}
                    <PCSkeleton isFetchingNextPage={isFetchingNextPage} />
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
                            {categoryFilter.length > 0 ||
                                sortOption !== "none" ||
                                stockFilter !== "all"
                                    ? "필터 조건에 맞는 상품이 없습니다"
                                    : "상품이 없습니다"}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {categoryFilter.length > 0 ||
                                sortOption !== "none" ||
                                stockFilter !== "all"
                                    ? "다른 필터 조건을 시도해보세요."
                                    : "새로운 상품을 등록해보세요."}
                        </p>
                    </div>
                )}
            </div>

            {isOpenUpdateCategoryModal && (
                <UpdateCategoryModal
                    onClose={() => setIsOpenUpdateCategoryModal(false)}
                />
            )}
            {isOpenUpdateModal && (
                <UpdateProductModal
                    onClose={() => setIsOpenUpdateModal(false)}
                    product={editProduct}
                    mode={onStatus}
                />
            )}
        </div>
    );
};

export default Products;
