"use client"; 

import CategoryList from "@/src/components/product/CategoryList";
import { Product } from "@src/components/product/interface"; 
import ProductsList from "@src/components/product/ProductsList"; 
import useProduct from "@src/shared/hooks/useProduct"; 
import SearchButton from "@src/widgets/button/SearchButton"; 
import { useMemo, useCallback, useState, useEffect } from "react"; 

const ShopClient = () => { 
    const { 
        category,
        products, 
        productsLoading, 
        filteredProducts, 
        section, 
    } = useProduct(); 

    const searchableProducts = useMemo(() => { 
        if (Array.isArray(filteredProducts)) return filteredProducts; 
        if (products && typeof products === "object" && "pages" in products)
            return products.pages?.flatMap((page: any) => page.data || page) || []; 
        return [];
    }, [products, filteredProducts]);

    const [searchQuery, setSearchQuery] = useState<string>(""); 
    const [searchFilteredProducts, setSearchFilteredProducts] = useState<Product[]>([]); 
    const [isSearchMode, setIsSearchMode] = useState<boolean>(false); 

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

    const handleRealTimeSearch = useCallback( 
        (query: string, searchResults: Product[]) => { 
            setSearchQuery(query); 
            setSearchFilteredProducts(searchResults); 
            setIsSearchMode(query.length > 0); 
        }, []
    ); 

    useEffect(() => { 
        if (!productsLoading && (filteredProducts.length > 0 || searchFilteredProducts.length > 0)) { 
            requestAnimationFrame(() => { 
                setTimeout(preloadImages, 100); 
            }); 
        } 
    }, [productsLoading, filteredProducts, searchFilteredProducts, preloadImages]); 

    const displayProducts = isSearchMode ? searchFilteredProducts : filteredProducts; 
    const isEmptyResults = isSearchMode && searchQuery && searchFilteredProducts.length === 0; 
    
    // [수정] 필터링 결과 상품이 없는 경우를 별도 변수로 관리한다 (검색 모드가 아닐 때)
    const isProductListEmpty = !isSearchMode && filteredProducts.length === 0;

    if (productsLoading) { 
        return ( 
            <div className="h-screen w-full flex items-center justify-center font-amstel text-xl sm:text-2xl">         
                <span>Loading...</span>
            </div> 
        ); 
    } 

    return (
        <div className="flex w-full min-h-full flex-col">
            <main className="flex w-full flex-col flex-grow">
                <div className="flex flex-col items-center">
                    <div className="relative flex w-[93vw] flex-col items-center justify-center py-12 mt-20 md:flex-row">
                        <div className="w-[10vh] md:w-auto md:absolute md:left-0 self-start">
                            <SearchButton
                                products={searchableProducts}
                                onSearch={handleRealTimeSearch}
                            />
                        </div>

                        {category && category.length > 0 && 
                            <CategoryList category={category} />}
                    </div>

                    {isProductListEmpty ? (
                        <div className="flex flex-col text-center w-full text-gray-900 font-pretendard text-base items-center justify-center py-[30vh]">
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
                        <div className="flex flex-col text-center w-full text-gray-900 font-pretendard text-base items-center justify-center py-[30vh]">
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
                            <ul className="mt-4 grid w-[93vw] animate-fade-in grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
                                {displayProducts.map((item, index) => (
                                    <ProductsList
                                        key={`${item._id}-${isSearchMode ? "search" : section}-${index}`}
                                        product={item}
                                        index={index}
                                    />
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
} 

export default ShopClient;
