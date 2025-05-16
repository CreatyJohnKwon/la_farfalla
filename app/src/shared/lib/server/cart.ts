import { SelectedItem } from "@/src/entities/type/interfaces";

const postCart = async (items: SelectedItem[]) => {
    try {
        const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(items),
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || "장바구니 저장 실패");
        }

        return await res.json();
    } catch (error) {
        console.error("Error for posting cart: ", error);
        throw new Error("Failed to post cart");
    }
};

const getCart = async () => {
    try {
        const res = await fetch("/api/cart");
        if (!res.ok) throw new Error("장바구니 요청 실패");
        const data = await res.json();
        return data;
    } catch (err) {
        console.error("장바구니 조회 실패:", err);
        return null;
    }
};

export { getCart, postCart };
