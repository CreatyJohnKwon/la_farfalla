import { Product } from "@/src/entities/type/interfaces";

const getProductList = async () => {
    const res = await fetch(`/api/admin/list/product`);
    if (!res.ok) throw new Error("상품 리스트 불러오기 실패");
    return await res.json();
};

const getProduct = async (id: string) => {
    const res = await fetch(`/api/product/?productId=${id}`);
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

export { getProductList, getProduct, postProduct, updateProduct };
