"use client"; 

 import { Product } from "@/src/components/product/interface"; 
 // import ProductListSkeleton from "@/src/components/product/ProductListSkeleton"; 
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
         isFetchingNextPage, 
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
                 console.log( 
                     `검색어: "${query}", 결과: ${searchResults.length}개`, 
                 ); 
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
             <div className="mb-10 h-screen w-screen"> 
                 <main className="flex h-full w-full flex-col items-center justify-center"> 
                     <ul className="grid w-[90vw] grid-cols-2 gap-2 sm:gap-3 md:mt-32 md:w-[85vw] md:grid-cols-3"> 
                         {/* <ProductListSkeleton /> */} 
                     </ul> 
                 </main> 
             </div> 
         ); 
     } 

     if ( 
         !searchableProducts || 
         (filteredProducts.length === 0 && !isSearchMode) 
     ) { 
         return ( 
             <div className="mb-10 h-screen w-screen"> 
                 <main className="flex h-full w-full flex-col items-center justify-center"> 
                     <div className="text-center"> 
                         <p className="text-lg text-gray-600"> 
                             상품이 없습니다. 
                         </p> 
                     </div> 
                 </main> 
             </div> 
         ); 
     } 

     return ( 
         <div className="mb-10 h-screen w-screen bg-transparent text-gray-900 font-sans"> 
             <main className="flex h-full w-full flex-col items-center"> 
                 <div 
                     className="h-full w-full overflow-y-auto" 
                     onScroll={handleProductListScroll} 
                 > 
                     <div className="flex min-h-screen flex-col items-center justify-center"> 
                         <SearchButton 
                             products={searchableProducts} 
                             onSearch={handleRealTimeSearch} 
                         /> 

                         {/* No search results message */} 
                         {isEmptyResults ? ( 
                             <div className="mt-8 text-center h-screen"> 
                                 <div className="mb-6"> 
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
                                 <ul className="mt-4 grid w-[90vw] animate-fade-in grid-cols-2 gap-2 sm:gap-3 md:w-[85vw] md:grid-cols-3"> 
                                     {displayProducts.map((item, index) => ( 
                                         <ProductsList 
                                             key={`${item._id}-${isSearchMode ? "search" : section}-${index}`} 
                                             product={item} 
                                             index={index} 
                                         /> 
                                     ))} 

                                     {/* Skeleton - Display only when not in search mode */} 
                                     {/*!isSearchMode && isFetchingNextPage && ( 
                                         // <ProductListSkeleton /> 
                                     )*/} 
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