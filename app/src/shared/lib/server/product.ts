import { Product } from "@/src/components/product/interface";

const getProductList = async (page = 1, limit = 9) => {
    const res = await fetch(`/api/product?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error("상품 리스트를 불러오는 데 실패했습니다.");
    return await res.json();
};

const getProduct = async (id: string) => {
    const res = await fetch(`/api/product?productId=${id}`);
    if (!res.ok) throw new Error("상품 정보 불러오기 실패");
    return await res.json();
};

const postProduct = async (productData: Product) => {
    const res = await fetch("/api/product", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "상품 생성 실패");
    }

    return await res.json();
};

const updateProduct = async (productData: Product) => {
    const res = await fetch(`/api/product?productId=${productData._id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "상품 수정 실패");
    }

    return await res.json();
};

const deleteProduct = async (productData: Product) => {
    try {
        const res = await fetch(`/api/product?productId=${productData._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "상품 삭제 실패");
        }

        return await res.json();
    } catch (error) {
        console.error("Error deleting product items:", error);
        throw new Error("Failed to delete product items");
    }
};

export {
    getProductList,
    getProduct,
    postProduct,
    updateProduct,
    deleteProduct,
};
