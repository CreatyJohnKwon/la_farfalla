const getSeason = async () => {
    try {
        const res = await fetch(`/api/season`);
        if (!res.ok) throw new Error("주문 리스트 불러오기 실패");
        return await res.json();
    } catch (error) {
        console.error("Error fetching home products:", error);
        throw new Error("Failed to fetch home products");
    }
};

export { getSeason };
