import { SelectedItem } from "@/src/entities/type/common";
import debounce from "lodash.debounce";

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

const deleteCart = async (ids: string[]) => {
    try {
        const res = await fetch("/api/cart", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids }),
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || "장바구니 삭제 실패");
        }

        return await res.json(); // { ok: true } 예상
    } catch (error) {
        console.error("Error deleting cart items:", error);
        throw new Error("Failed to delete cart items");
    }
};

const updateQuantity = debounce(async (item: SelectedItem) => {
    try {
        await fetch("/api/cart", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
        });
    } catch (error) {
        console.error("수량 업데이트 실패:", error);
    }
}, 500);

export { getCart, postCart, deleteCart, updateQuantity };
