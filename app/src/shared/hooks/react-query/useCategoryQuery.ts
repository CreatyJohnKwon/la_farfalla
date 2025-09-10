import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../../lib/server/category";
import { 
    Category,
    CreateCategoryData, 
    UpdateCategoryData  
} from "@src/entities/type/interfaces";

const categoriesQueryKey = ["categories"];

const useCategoriesQuery = () => {
    return useQuery<Category[], Error>({
        queryKey: categoriesQueryKey,
        queryFn: getCategories,
        staleTime: 1000 * 60 * 60, // 1시간
        gcTime: 1000 * 60 * 60 * 2, // 2시간
    });
};

const useCreateCategoryMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newCategory: CreateCategoryData) => createCategory(newCategory),
        
        // Optimistic Update: Mutation이 시작될 때 실행
        onMutate: async (newCategory) => {
            // 진행 중인 refetch를 취소하여 덮어쓰기 방지
            await queryClient.cancelQueries({ queryKey: categoriesQueryKey });

            // 이전 데이터 스냅샷 생성
            const previousCategories = queryClient.getQueryData<Category[]>(categoriesQueryKey);

            // 캐시를 새 데이터로 낙관적으로 업데이트
            queryClient.setQueryData<Category[]>(categoriesQueryKey, (old = []) => [
                ...old,
                { ...newCategory, _id: 'temp-id', slug: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } // 임시 데이터
            ]);
            
            // 스냅샷 반환
            return { previousCategories };
        },
        
        // 에러 발생 시 onMutate에서 반환된 스냅샷으로 롤백
        onError: (err, newCategory, context) => {
            if (context?.previousCategories) {
                queryClient.setQueryData(categoriesQueryKey, context.previousCategories);
            }
            console.error("카테고리 생성 실패:", err);
            // 여기에 사용자에게 보여줄 에러 알림(toast 등)을 추가하면 좋습니다.
        },
        
        // 성공/실패 여부와 관계없이 항상 실행 (데이터 동기화)
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
        },
    });
};

const useUpdateCategoryMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (updatedCategory: UpdateCategoryData) => updateCategory(updatedCategory),
        onMutate: async (updatedCategory) => {
            await queryClient.cancelQueries({ queryKey: categoriesQueryKey });
            const previousCategories = queryClient.getQueryData<Category[]>(categoriesQueryKey);
            
            queryClient.setQueryData<Category[]>(categoriesQueryKey, (old = []) => 
                old.map(category => 
                    category._id === updatedCategory._id ? { ...category, ...updatedCategory } : category
                )
            );

            return { previousCategories };
        },
        onError: (err, updatedCategory, context) => {
            if (context?.previousCategories) {
                queryClient.setQueryData(categoriesQueryKey, context.previousCategories);
            }
            console.error("카테고리 수정 실패:", err);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
        },
    });
};

const useDeleteCategoryMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteCategory(id),
        onMutate: async (idToDelete) => {
            await queryClient.cancelQueries({ queryKey: categoriesQueryKey });
            const previousCategories = queryClient.getQueryData<Category[]>(categoriesQueryKey);

            queryClient.setQueryData<Category[]>(categoriesQueryKey, (old = []) => 
                old.filter(category => category._id !== idToDelete)
            );

            return { previousCategories };
        },
        onError: (err, id, context) => {
            if (context?.previousCategories) {
                queryClient.setQueryData(categoriesQueryKey, context.previousCategories);
            }
            console.error("카테고리 삭제 실패:", err);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: categoriesQueryKey });
        },
    });
};

export {
    useCategoriesQuery,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation
}