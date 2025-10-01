"use client"; 

import { useInView } from "react-intersection-observer";
import { useMemo, useCallback, useState, useEffect } from "react"; 

import CategoryList from "@src/components/product/CategoryList";
import SkeletonGrid from "@src/components/product/SkeletonGrid";
import ProductsList from "@src/components/product/ProductsList"; 

import useProduct from "@src/shared/hooks/useProduct"; 
import SearchButton from "@src/widgets/button/SearchButton"; 
import { Product } from "@src/entities/type/products"; 

const ShopClient = () => { 
    const { 
        category,
        products,
        productsLoading,
        filteredProducts,
        section,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useProduct(); 

    const [showScrollTopButton, setShowScrollTopButton] = useState<boolean>(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollThreshold = (document.documentElement.scrollHeight - document.documentElement.clientHeight) * 0.5;

            if (window.scrollY > scrollThreshold) {
                setShowScrollTopButton(true);
            } else {
                setShowScrollTopButton(false);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const searchableProducts = useMemo(() => {
        if (Array.isArray(filteredProducts)) return filteredProducts;
        if (products && typeof products === "object" && "pages" in products)
            return products.pages.flatMap((page: any) => page.data || page) || [];
        return [];
    }, [products, filteredProducts]);

    const handleRealTimeSearch = useCallback( 
        (query: string, searchResults: Product[]) => { 
            setSearchQuery(query); 
            setSearchFilteredProducts(searchResults); 
            setIsSearchMode(query.length > 0); 
        }, []
    ); 

    const [searchQuery, setSearchQuery] = useState<string>(""); 
    const [searchFilteredProducts, setSearchFilteredProducts] = useState<Product[]>([]); 
    const [isSearchMode, setIsSearchMode] = useState<boolean>(false); 

    const { ref, inView } = useInView({
        threshold: 0, // 요소가 1px이라도 보이면 트리거
    });

    useEffect(() => {
        // 검색 모드가 아닐 때, 다음 페이지가 있고, 로딩 중이 아닐 때만 실행
        if (inView && hasNextPage && !isSearchMode && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isSearchMode, fetchNextPage, isFetchingNextPage]);

    const preloadImages = useCallback(() => { 
        const productsToPreload = isSearchMode 
            ? searchFilteredProducts.slice(0, 3) 
            : filteredProducts.slice(0, 3); 

        if (productsToPreload.length > 0) { 
            productsToPreload.forEach((item) => { 
                if (item.image?.[0]) { 
                    const img = new window.Image(); 
                    img.src = item.image[0]; 
                    if (item.image[0].includes("r2.dev")) { 
                        const url = new URL(item.image[0]); 
                        url.searchParams.set("width", "500"); 
                        url.searchParams.set("quality", "80"); 
                        url.searchParams.set("format", "webp"); 
                        img.src = url.toString(); 
                    } 
                } 
            }); 
        } 
    }, [isSearchMode, searchFilteredProducts, filteredProducts]); 

    useEffect(() => { 
        if (!productsLoading && (filteredProducts.length > 0 || searchFilteredProducts.length > 0)) { 
            requestAnimationFrame(() => { 
                setTimeout(preloadImages, 100);
            }); 
        } 
    }, [productsLoading, filteredProducts, searchFilteredProducts, preloadImages]); 

    const displayProducts = isSearchMode ? searchFilteredProducts : filteredProducts; 
    const isEmptyResults = isSearchMode && searchQuery && searchFilteredProducts.length === 0; 
    const isProductListEmpty = !isSearchMode && !productsLoading && filteredProducts.length === 0;

    return (
        <div className="flex w-full min-h-screen h-auto flex-col">
            <main className="flex w-full flex-col flex-grow">
                <div className="flex flex-col items-center">
                    <div className="fixed top-0 flex w-full flex-col items-center justify-center pt-16 pb-5 mt-5 md:mt-12 md:flex-row bg-white z-10">
                        <div className="w-[10vh] md:w-auto md:absolute md:left-0 self-start ms-[3vw]">
                            <SearchButton
                                products={searchableProducts}
                                onSearch={handleRealTimeSearch}
                            />
                        </div>

                        <div className="flex items-center justify-center pt-6 md:pt-0">
                            {!productsLoading && category ?
                                <CategoryList category={category} /> :
                                <ul className="flex h-full animate-pulse flex-row gap-4 font-amstel text-xs sm:gap-5 sm:text-base">
                                    <li className="h-5 w-16 rounded-md bg-gray-200 sm:h-6"></li>
                                    <li className="h-5 w-10 rounded-md bg-gray-200 sm:h-6"></li>
                                    <li className="h-5 w-24 rounded-md bg-gray-200 sm:h-6"></li>
                                    <li className="h-5 w-20 rounded-md bg-gray-200 sm:h-6"></li>
                                </ul>
                            }
                        </div>
                    </div>

                    <div className="ease-in-out transition-all pt-[24vh] sm:pt-[18vh]">
                        {productsLoading && !isFetchingNextPage ? (
                            <SkeletonGrid count={6} />
                        ) : (
                            <>
                                {isProductListEmpty ? (
                                    <div className="flex flex-col text-center w-full text-gray-900 font-pretendard text-base items-center justify-center py-[20vh] sm:py-[40vh]">
                                        <div className="mb-4">
                                            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={0.7} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                            </svg>
                                        </div>
                                        <h3 className="mb-2 text-lg font-medium text-gray-700">
                                            상품이 없습니다
                                        </h3>
                                        <p className="text-gray-500">
                                            선택하신 카테고리에 해당하는 상품이 없습니다.
                                        </p>
                                    </div>
                                ) : isEmptyResults ? (
                                    <div className="flex flex-col text-center w-full text-gray-900 font-pretendard text-base items-center justify-center py-[20vh] sm:py-[40vh]">
                                        <div className="mb-4">
                                            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.7} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="mb-2 text-lg font-medium text-gray-700">
                                            검색 결과가 없습니다
                                        </h3>
                                        <p className="mb-4 text-gray-500">
                                            '{searchQuery}'에 대한 상품을 찾을 수 없습니다.
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <ul className="grid w-[93vw] animate-fade-in grid-cols-2 gap-2 sm:gap-24 lg:grid-cols-3 ease-in-out transition-all">
                                            {displayProducts.map((item: Product, index: number) => (
                                                <ProductsList
                                                    key={`${item._id}-${isSearchMode ? "search" : section}-${index}`}
                                                    product={item}
                                                    index={index}
                                                />
                                            ))}
                                        </ul>
            
                                        <div ref={ref} className="h-10" />
            
                                        {isFetchingNextPage && (
                                            <div className="py-8 text-center">
                                                <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* 맨 위로 가기 버튼 */}
            <button
                onClick={scrollToTop}
                aria-label="맨 위로 스크롤"
                className={`fixed bottom-24 hover:bottom-28 right-8 z-50 md:p-3 md:pb-5 text-black hover:text-black/50 transition-all duration-300 ${
                    showScrollTopButton ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 15.75l7.5-7.5 7.5 7.5"
                    />
                </svg>
            </button>
        </div>
    );
} 

export default ShopClient;
