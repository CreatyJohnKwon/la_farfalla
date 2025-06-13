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

export { getProductList, getProduct };
