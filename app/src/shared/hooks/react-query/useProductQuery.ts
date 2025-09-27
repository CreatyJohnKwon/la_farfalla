import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    deleteProduct,
    getProduct,
    getProductList,
    postProduct,
    updateProduct,
} from "@src/shared/lib/server/product";
import { useSetAtom } from "jotai";
import { loadingAtom, resetProductFormAtom } from "@src/shared/lib/atom";
import { InfiniteQueryResult, Product, ProductPage } from "@src/entities/type/products";

// 무한 스크롤 사용
const useProductListQuery = (limit = 9, initialData?: Product[]) => {
    return useInfiniteQuery<    
        ProductPage,
        Error,
        InfiniteQueryResult,
        string[],
        number
    >({
        queryKey: ["get-product-list"],
        queryFn: async ({ pageParam = 1 }) => {
            return await getProductList(pageParam, limit);
        },
        getNextPageParam: (lastPage, allPages) => lastPage.hasMore ? allPages.length + 1 : undefined,
        initialPageParam: 1,
        staleTime: 0, // 3분
        retry: false,
                initialData: initialData ? {
            pages: [{ data: initialData, hasMore: initialData.length === limit }],
            pageParams: [1] 
        } : undefined,
    });
};

const useProductQuery = (id: string) => {
    return useQuery<Product, Error>({
        queryKey: ["get-product", id],
        queryFn: () => getProduct(id),
        staleTime: 0, // 항상 refresh
        retry: false, // 실패시 재시도 OFF
    });
};

const usePostProductMutation = () => {
    const queryClient = useQueryClient();
    const setLoading = useSetAtom(loadingAtom);
    const resetProductForm = useSetAtom(resetProductFormAtom);

    return useMutation<Product, Error, Product>({
        mutationFn: async (productData: Product) => {
            const payload = {
                ...productData,
                additionalOptions: productData.additionalOptions?.map(({ id, ...rest }) => rest),
            };
            return postProduct(payload);
        },
        onSuccess: () => {
            // 상품 리스트 캐시 업데이트
            queryClient.invalidateQueries({ queryKey: ["get-product-list"] });
            alert(`상품이 등록되었습니다`);
            resetProductForm();
        },
        onError: (error) => {
            alert(`상품 등록 중 오류가 발생했습니다: ${error.message}`);
        },
        onSettled: () => {
            setLoading(false);
        },
    });
};

const useUpdateProductMutation = () => {
    const queryClient = useQueryClient();
    const setLoading = useSetAtom(loadingAtom);
    const resetProductForm = useSetAtom(resetProductFormAtom);

    return useMutation({
        mutationFn: async (productData: Product) => {
            const payload = {
                ...productData,
                additionalOptions: productData.additionalOptions?.map(({ id, ...rest }) => rest),
            };
            return updateProduct(payload);
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["get-product-list"] });
            // 특정 상품 캐시도 업데이트
            queryClient.invalidateQueries({
                queryKey: ["get-product", data._id],
            });
            alert(`상품 정보가 수정되었습니다!`);
            resetProductForm();
        },
        onError: (error) => {
            console.error("❌ 상품 수정 실패", error);
            alert(`상품 수정 중 오류가 발생했습니다: ${error.message}`);
        },
        onSettled: () => {
            setLoading(false);
        },
    });
};

const useDeleteProductMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (productData: Product) => {
            return deleteProduct(productData);
        },

        onSuccess: (productId) => {
            queryClient.invalidateQueries({
                queryKey: ["get-product-list"],
            });
            queryClient.removeQueries({
                queryKey: ["get-product-list", productId],
            });
            alert("상품이 삭제되었습니다!");
        },

        onError: (error) => {
            console.error("❌ 삭제 실패", error);
            alert(`상품 삭제 중 오류가 발생했습니다: ${error.message}`);
        },
    });
};

export {
    useProductListQuery,
    useProductQuery,
    usePostProductMutation,
    useDeleteProductMutation,
    useUpdateProductMutation,
};
