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

const useProduct = () => {
    const [section, setSection] = useAtom(sectionAtom);
    const [openSidebar, setOpenSidebar] = useAtom(sidebarAtom);
    const [formData, setFormData] = useAtom(productFormDatasAtom);
    const resetProductForm = useSetAtom(resetProductFormAtom);

    const { mutateAsync: deleteProduct } = useDeleteProductMutation();
    const {
        data: productsData,
        isLoading: productsLoading,
        refetch: useRefetchProducts,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useProductListQuery(9);
    const { data: category, isLoading: categoryLoading, error: categoryError } = useCategoriesQuery();

    // 상품[] 메모이제이션 평탄화
    const products = useMemo(() => {
        return productsData?.pages.flatMap(page => page.data || []) ?? [];
    }, [productsData]);

    const returnCategories = (categoryIds?: string[]): string[] => {
        if (!category || !categoryIds) return [];

        const result = category
            .filter(cat => categoryIds.includes(cat._id))
            .map(cat => cat.name);

        return result.length > 0  ? result : ["All"];
    };

    const returnCategory = (categoryId?: string): string => {
        if (!category || !categoryId) return "";

        const foundCategory = category.find(cat => cat._id === categoryId);

        return foundCategory?.name ?? "";
    };

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

    // 카테고리에 따라 필터링된 상품 목록
    const filteredProducts = useMemo(() => {
        if (!products) return [];
        if (section === "") {
            return products;
        }
        return products.filter(product => 
            returnCategories(product.categories).includes(section)) || section === "All"
    }, [products, section]);

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
        products: productsData, // 원본 InfiniteData 객체도 전달
        productsLoading,

        // 페이징 관련
        useRefetchProducts,
        flatProducts: products, // 평탄화된 배열
        filteredProducts,      // 필터링된 배열
        fetchNextPage,
        hasNextPage,

        // 카테고리
        category,
        categoryLoading,
        categoryError,
        returnCategories,
        returnCategory
    };
};

export default useProduct;
