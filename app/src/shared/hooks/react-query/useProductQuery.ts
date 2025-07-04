import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Product, Season } from "@/src/entities/type/interfaces";
import {
    deleteProduct,
    getProduct,
    getProductList,
    postProduct,
    updateProduct,
} from "../../lib/server/product";
import { useSetAtom } from "jotai";
import { loadingAtom, resetProductFormAtom } from "../../lib/atom";
import useProduct from "../useProduct";

const useProductListQuery = () => {
    return useQuery<Product[], Error>({
        queryKey: ["get-product-list"],
        queryFn: () => getProductList(),
        staleTime: 1000 * 60 * 3, // 3분 캐시
        retry: false, // 실패시 재시도 OFF
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
