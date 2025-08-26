import { useAtom, useSetAtom } from "jotai";
import {
    productFormDatasAtom,
    resetProductFormAtom,
    sectionAtom,
    sidebarAtom,
} from "@src/shared/lib/atom";
import { useDeleteProductMutation, useProductListQuery } from "./react-query/useProductQuery";
import { useEffect, useMemo } from "react";
import { Product } from "@/src/components/product/interface";

const useProduct = (initialProducts?: Product[]) => {
    const [section, setSection] = useAtom(sectionAtom);
    const [openSidebar, setOpenSidebar] = useAtom(sidebarAtom);
    const [formData, setFormData] = useAtom(productFormDatasAtom);
    const resetProductForm = useSetAtom(resetProductFormAtom);

    const { mutateAsync: deleteProduct } = useDeleteProductMutation();
    const {
        data: products,
        isLoading: productsLoading,
        refetch: useRefetchProducts,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useProductListQuery(9, initialProducts);

    // product list data memoization
    const filteredProducts = useMemo(() => {
        if (!products?.pages) return [];

        // pages 안에 있는 모든 data 배열을 펼쳐서 하나로 만듦
        const allProducts = products.pages.flatMap(page => page.data);

        return allProducts.filter(item => section === "" || item.seasonName === section);
    }, [products, section]);

    const handleProductListScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

        if (
            // scrollHeight - scrollTop <= clientHeight * 1.5 &&
            scrollTop > scrollHeight - clientHeight * 1.5 &&
            hasNextPage &&
            !isFetchingNextPage
        ) {
            // 추가 데이터 생성 (9개 씩)
            fetchNextPage();
        }
    };

    useEffect(() => {
        console.log(filteredProducts)
    }, [])


    return {
        openSidebar,
        setOpenSidebar,
        section,
        setSection,
        formData,
        setFormData,

        resetProductForm,

        // 상품 삭제 뮤테이션
        deleteProduct,

        // 스크롤 이벤트 핸들러
        handleProductListScroll,
        isFetchingNextPage,

        // 상품 리스트 쿼리
        products,
        productsLoading,

        // 페이징 관련
        useRefetchProducts,
        filteredProducts
    };
};

export default useProduct;
