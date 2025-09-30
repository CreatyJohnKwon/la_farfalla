import { Product, SortOption } from "@/src/entities/type/products";
import useProduct from "@/src/shared/hooks/useProduct";
import { Dispatch, SetStateAction } from "react";

const AdminProductListHeader = ({
    sortOption,
    setSortOption,
    stockFilter,
    setStockFilter,
    resetFilters,
    categoryFilter,
    uniqueCategory,
    setOnStatus,
    setIsOpenUpdateModal,
    setIsOpenUpdateCategoryModal,
    filteredProducts,
    filteredAndSortedProducts,
    handleCategoryToggle,
}: {
    sortOption: SortOption;
    setSortOption: Dispatch<SetStateAction<SortOption>>;
    stockFilter: "all" | "in_stock" | "out_of_stock";
    setStockFilter: Dispatch<SetStateAction<"all" | "in_stock" | "out_of_stock">>;
    categoryFilter: string[];
    resetFilters: () => void;
    setOnStatus: Dispatch<SetStateAction<"create" | "update" | undefined>>;
    setIsOpenUpdateModal: Dispatch<SetStateAction<boolean>>;
    setIsOpenUpdateCategoryModal: Dispatch<SetStateAction<boolean>>;
    uniqueCategory: string[];
    filteredProducts: Product[];
    filteredAndSortedProducts: Product[];
    handleCategoryToggle: (categoryId: string) => void;
}) => {
    const {
        useRefetchProducts,
        returnCategory
    } = useProduct();

    return (
        <header className="mb-6 mt-[7vh]">
            <div className="flex flex-col gap-4">
                {/* 타이틀과 컨트롤 버튼들 */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-semibold text-gray-800 sm:text-2xl">
                            상품 관리
                        </h1>
                        <button
                            onClick={() => useRefetchProducts()}
                            className="whitespace-nowrap rounded-md bg-gray-800 px-2 py-2 text-sm text-white hover:bg-gray-700"
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
                        <button
                            onClick={() => {
                                setIsOpenUpdateModal(true);
                                setOnStatus("create");
                            }}
                            className="whitespace-nowrap rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
                        >
                            상품 등록
                        </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setIsOpenUpdateCategoryModal(true)}
                            className="whitespace-nowrap rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
                        >
                            카테고리 관리
                        </button>
                    </div>
                </div>

                {/* 필터 정보 바 */}
                <div className="flex flex-col gap-4 rounded-lg bg-gray-50 p-4">
                    {/* 1행: 필터 컨트롤 */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                        {/* 카테고리 필터 */}
                        <div className="flex items-center gap-2">
                            <span className="flex-shrink-0 text-sm text-gray-600">
                                카테고리:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {uniqueCategory.map((categoryId) => (
                                    returnCategory(categoryId) ?
                                        <button
                                            key={categoryId}
                                            onClick={() => handleCategoryToggle(categoryId)}
                                            className={`min-h-[35px] rounded-sm border px-3 py-1 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                                ${categoryFilter.includes(categoryId)
                                                    ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
                                                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                                                }`}
                                        >
                                            {returnCategory(categoryId)}
                                        </button> : null
                                ))}
                            </div>
                        </div>
                        {/* 재고 및 정렬 필터 */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
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
                                    className="max-h-[44px] w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm hover:border-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:w-auto sm:min-w-[120px]"
                                >
                                    <option value="all">전체</option>
                                    <option value="in_stock">재고 있음</option>
                                    <option value="out_of_stock">품절</option>
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
                                    className="max-h-[44px] w-full rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm hover:border-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 sm:w-auto sm:min-w-[140px]"
                                >
                                    <option value="none">기본 순서</option>
                                    <option value="latest">최근 등록순</option>
                                    <option value="oldest">오래된 등록순</option>
                                    <option value="name_asc">상품명 ㄱ-ㅎ 순</option>
                                    <option value="name_desc">상품명 ㅎ-ㄱ 순</option>
                                    <option value="price_asc">가격 낮은 순</option>
                                    <option value="price_desc">가격 높은 순</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    {/* 2행: 활성 필터 정보 */}
                    {(categoryFilter.length > 0 || sortOption !== "none" || stockFilter !== "all") && (
                        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-4">
                            <div className="flex flex-wrap items-center gap-4">
                                {/* 활성 필터 태그 */}
                                <div className="flex flex-wrap gap-2">
                                    {categoryFilter.map((catId) => (
                                        <span key={catId} className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                                            카테고리: {returnCategory(catId)}
                                            <button
                                                onClick={() => handleCategoryToggle(catId)}
                                                className="ml-1 hover:text-blue-600"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                    {stockFilter !== "all" && (
                                        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                                            재고: {stockFilter === "in_stock" ? "재고 있음" : "품절"}
                                            <button
                                                onClick={() => setStockFilter("all")}
                                                className="ml-1 hover:text-green-600"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {sortOption !== "none" && (
                                        <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800">
                                            정렬: {
                                                {
                                                    "latest": "최근 등록순",
                                                    "oldest": "오래된 등록순",
                                                    "name_asc": "상품명 ㄱ-ㅎ 순",
                                                    "name_desc": "상품명 ㅎ-ㄱ 순",
                                                    "price_asc": "가격 낮은 순",
                                                    "price_desc": "가격 높은 순"
                                                }[sortOption]
                                            }
                                            <button
                                                onClick={() => setSortOption("none")}
                                                className="ml-1 hover:text-purple-600"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={resetFilters}
                                    className="rounded-sm border border-gray-300 px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
                                >
                                    필터 초기화
                                </button>
                            </div>
                            <div className="text-sm text-gray-600">
                                총 <span className="font-medium text-blue-600">{filteredAndSortedProducts.length}</span> 개 상품
                                {filteredProducts && filteredAndSortedProducts.length !== filteredProducts.length && (
                                    <span className="ml-1 text-gray-500">
                                        (전체 {filteredProducts.length}개 중)
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default AdminProductListHeader;