"use client"; 

 import { Product } from "@/src/components/product/interface"; 
 import ProductsList from "@/src/components/product/ProductsList"; 
 import useProduct from "@/src/shared/hooks/useProduct"; 
 import SearchButton from "@/src/widgets/button/SearchButton"; 
 import { useMemo, useCallback, useState, useEffect } from "react"; 

 const ShopClient = () => { 
     const { 
         products, 
         productsLoading, 
         filteredProducts, 
         section, 
         isFetchingNextPage, // 추후에 무한 스크롤 할 경우 스켈레톤 UI 를 위한
         handleProductListScroll, 
     } = useProduct(); 

     // Prepare product data for search bar (flattened array) 
     const searchableProducts = useMemo(() => { 
         // If filteredProducts is already a Product[] array, use it as is. 
         if (Array.isArray(filteredProducts)) return filteredProducts; 

         // If products is in InfiniteQueryResult format, flatten it. 
         if (products && typeof products === "object" && "pages" in products) { 
             return ( 
                 products.pages?.flatMap((page: any) => page.data || page) || [] 
             ); 
         } 

         // Default value 
         return []; 
     }, [products, filteredProducts]); 

     // Search related states 
     const [searchQuery, setSearchQuery] = useState<string>(""); 
     const [searchFilteredProducts, setSearchFilteredProducts] = useState<Product[]>([]); 
     const [isSearchMode, setIsSearchMode] = useState<boolean>(false); 

     // Function to preload images 
     const preloadImages = useCallback(() => { 
         const productsToPreload = isSearchMode 
             ? searchFilteredProducts.slice(0, 3) 
             : filteredProducts.slice(0, 3); 

         if (productsToPreload.length > 0) { 
             productsToPreload.forEach((item) => { 
                 if (item.image?.[0]) { 
                     const img = new window.Image(); 
                     img.src = item.image[0]; 
                     // Add R2 optimization parameters 
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

     // Function to handle real-time search 
     const handleRealTimeSearch = useCallback( 
         (query: string, searchResults: Product[]) => { 
             setSearchQuery(query); 
             setSearchFilteredProducts(searchResults); 
             setIsSearchMode(query.length > 0); 

             // Logging for search analysis (optional) 
             if (query.length > 0) { 
                //  console.log( 
                //      `검색어: "${query}", 결과: ${searchResults.length}개`, 
                //  ); 
             } 
         }, 
         [], 
     ); 

     // Preload images on component mount 
     useEffect(() => { 
         if ( 
             !productsLoading && 
             (filteredProducts.length > 0 || searchFilteredProducts.length > 0) 
         ) { 
             // Execute preload on the next frame 
             requestAnimationFrame(() => { 
                 setTimeout(preloadImages, 100); 
             }); 
         } 
     }, [ 
         productsLoading, 
         filteredProducts, 
         searchFilteredProducts, 
         preloadImages, 
     ]); 

     // Determine the list of products to display 
     const displayProducts = isSearchMode 
         ? searchFilteredProducts 
         : filteredProducts; 
     const isEmptyResults = 
         isSearchMode && searchQuery && searchFilteredProducts.length === 0; 

     if (productsLoading) { 
         return ( 
            <div className="h-screen w-full flex items-center justify-center font-amstel text-xl sm:text-2xl">         
                <span>Loading...</span>
            </div> 
         ); 
     } 

     if ( 
         !searchableProducts || 
         (filteredProducts.length === 0 && !isSearchMode) 
     ) { 
         return ( 
             <div className="h-screen w-full"> 
                <main className="flex h-full w-full flex-col items-center justify-center"> 
                    <div className="text-center"> 
                        <span className="text-lg text-gray-600"> 
                            상품이 없습니다.
                        </span> 
                    </div> 
                </main> 
             </div> 
         ); 
     } 

     return ( 
         <div className="h-full w-full"> 
             <main className="flex h-full w-full flex-col"> 
                 <div 
                     className="h-full w-full overflow-y-auto" 
                     onScroll={handleProductListScroll} 
                 > 
                     <div className="flex min-h-full flex-col items-center justify-center"> 
                         <SearchButton 
                             products={searchableProducts} 
                             onSearch={handleRealTimeSearch} 
                         /> 

                         {/* No search results message */} 
                         {isEmptyResults ? ( 
                            <div className="flex flex-col text-center h-full text-gray-900 font-pretendard items-center justify-center mt-[25vh]"> 
                                <div className="mb-4"> 
                                    <svg 
                                        className="mx-auto h-16 w-16 text-gray-400" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24" 
                                    > 
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={1.5} 
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                                        /> 
                                    </svg> 
                                </div> 
                                <h3 className="mb-2 text-lg font-medium text-gray-700"> 
                                    검색 결과가 없습니다 
                                </h3> 
                                <p className="mb-4 text-gray-500"> 
                                    '{searchQuery}'에 대한 상품을 찾을 수 
                                    없습니다. 
                                </p> 
                            </div> 
                         ) : ( 
                            <div> 
                                {/* Product grid */} 
                                <ul className="mt-4 grid w-[90vw] md:w-[85vw] animate-fade-in grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3"> 
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
                 </div> 
             </main> 
         </div> 
     ); 
 } 

 export default ShopClient;