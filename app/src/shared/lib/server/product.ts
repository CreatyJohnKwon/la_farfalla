const getAllProduct = async () => {
    const res = await fetch(`/api/admin/list/product`);
    if (!res.ok) throw new Error("주문 리스트 불러오기 실패");
    return await res.json();
};

export { getAllProduct };
