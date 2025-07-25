import { useInfiniteQuery, useMutation, useQuery, useQueryClient, QueryFunctionContext } from "@tanstack/react-query";
import {
    deleteProduct,
    getProduct,
    getProductList,
    postProduct,
    updateProduct,
} from "../../lib/server/product";
import { useSetAtom } from "jotai";
import { loadingAtom, resetProductFormAtom } from "../../lib/atom";
import { Product } from "@/src/components/product/interface";

type ProductListResponse = {
    data: Product[];
    hasMore: boolean;
}

type ProductPage = {
  data: Product[];    // 실제 상품 리스트
  hasMore: boolean;  // 다음 페이지 존재 여부
};

// useInfiniteQuery 반환값 타입
type InfiniteQueryResult = {
  pages: ProductPage[];  // pages 배열이 ProductPage 객체 배열임
  pageParams: number[];  // 페이지 번호 배열
};

// 무한 스크롤 사용
const useProductListQuery = (limit = 9) => {
    return useInfiniteQuery<    
        ProductPage,    // TData
        Error,                 // TError
        InfiniteQueryResult,   // TSelect 결과 (그냥 동일)
        string[],              // queryKey 타입
        number
    >({
        queryKey: ["get-product-list"],
        queryFn: async ({ pageParam = 1 }) => {
            return await getProductList(pageParam, limit);
        },
            getNextPageParam: (lastPage, allPages) => lastPage.hasMore ? allPages.length + 1 : undefined,
        initialPageParam: 1,
        staleTime: 1000 * 60 * 3,
        retry: false,
    })
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
        mutationFn: async (productData: Product) => postProduct(productData),
        onSuccess: () => {
            // 상품 리스트 캐시 업데이트
            queryClient.invalidateQueries({ queryKey: ["get-product-list"] });
            alert(`상품 업데이트 완료!`);
            resetProductForm();
        },
        onError: (error) => {
            alert(`상품 업데이트 중 오류가 발생했어요: ${error.message}`);
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
        mutationFn: async (productData: Product) => updateProduct(productData), // PUT /products/:id
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["get-product-list"] });
            // 특정 상품 캐시도 업데이트
            queryClient.invalidateQueries({
                queryKey: ["get-product", data.id],
            });
            alert(`상품 정보가 수정되었습니다!`);
            resetProductForm();
        },
        onError: (error) => {
            console.error("❌ 상품 수정 실패", error);
            alert(`상품 수정 중 오류가 발생했어요: ${error.message}`);
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
            alert(`상품 삭제 중 오류가 발생했어요: ${error.message}`);
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
