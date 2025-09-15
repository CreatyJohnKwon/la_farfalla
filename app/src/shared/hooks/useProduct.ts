import { useAtom, useSetAtom } from "jotai";
import {
    productFormDatasAtom,
    resetProductFormAtom,
    sectionAtom,
    sidebarAtom,
} from "@src/shared/lib/atom";
import { useDeleteProductMutation, useProductListQuery } from "./react-query/useProductQuery";
import { useMemo } from "react";
import { useCategoriesQuery } from "./react-query/useCategoryQuery";
import { Category } from "@/src/entities/type/interfaces";

const useProduct = () => {
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
    } = useProductListQuery(9);
    const { data: category, isLoading: categoryLoading, error: categoryError } = useCategoriesQuery();

    const returnCategories = (categoryIds?: string[]): string[] => {
        if (!category || !categoryIds) return [];

        const result = category
            .filter(cat => categoryIds.includes(cat._id))
            .map(cat => cat.name);

        return result
    };

    const returnCategory = (categoryId?: string): string => {
        if (!category || !categoryId) return "";

        const foundCategory = category.find(cat => cat._id === categoryId);

        return foundCategory?.name ?? "";
    };

    // 의존성을 나누어 메모이제이션 다중 콜링 오류를 제거
    const allProducts = useMemo(() => {
        return products?.pages?.flatMap(page => page.data) ?? [];
    }, [products?.pages]);

    // product list data memoization
    const filteredProducts = useMemo(() => {
        if (section === "") return allProducts;
        
        return allProducts.filter(item => returnCategories(item.categories).includes(section));
    }, [allProducts, section]);

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
        filteredProducts,

        // 카테고리
        category,
        categoryLoading,
        categoryError,
        returnCategories,
        returnCategory
    };
};

export default useProduct;
