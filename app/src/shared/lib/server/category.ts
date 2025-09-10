import { Category, CreateCategoryData, UpdateCategoryData } from "@src/entities/type/interfaces";
import { baseUrl } from "public/data/common";

/**
 * 모든 카테고리 목록을 가져옵니다. (클라이언트 사이드용)
 */
const getCategories = async (): Promise<Category[]> => {
    try {
        const res = await fetch(`/api/categories`);
        if (!res.ok) throw new Error("카테고리 목록을 불러오는데 실패했습니다.");
        return await res.json();
    } catch (error) {
        console.error("Error fetching categories:", error);
        throw new Error("Failed to fetch categories");
    }
};

/**
 * 새로운 카테고리를 생성합니다.
 * @param data - { name, description, displayOrder }
 */
const createCategory = async (data: CreateCategoryData): Promise<Category> => {
    try {
        const res = await fetch(`/api/categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "카테고리 생성에 실패했습니다.");
        }
        return await res.json();
    } catch (error) {
        console.error("Error creating category:", error);
        throw error; // 여기서 잡은 에러를 그대로 다시 던져서 호출한 쪽에서 처리하게 함
    }
};

/**
 * 카테고리 정보를 수정합니다.
 * @param data - { _id, name, description, displayOrder }
 */
const updateCategory = async (data: UpdateCategoryData): Promise<Category> => {
    try {
        const res = await fetch(`/api/categories`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "카테고리 수정에 실패했습니다.");
        }
        return await res.json();
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
};

/**
 * 특정 카테고리를 삭제합니다.
 * @param id - 삭제할 카테고리의 ID
 */
const deleteCategory = async (id: string): Promise<{ message: string }> => {
    try {
        const res = await fetch(`/api/categories?id=${id}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "카테고리 삭제에 실패했습니다.");
        }
        return await res.json();
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
};


/**
 * revalidate 옵션과 함께 모든 카테고리를 가져옵니다. (주로 서버 컴포넌트나 SSG용)
 */
const fetchCategories = async (): Promise<Category[]> => {
    if (!baseUrl) {
        throw new Error("baseUrl 이 설정되지 않았습니다. baseUrl: " + baseUrl);
    }

    const response = await fetch(`${baseUrl}/api/categories`, {
        method: 'GET',
        next: { revalidate: 3600 }, // 1시간 캐시
    });

    if (!response.ok) {
        throw new Error('Failed to fetch category data.');
    }
    return response.json();
}


export { getCategories, createCategory, updateCategory, deleteCategory, fetchCategories };