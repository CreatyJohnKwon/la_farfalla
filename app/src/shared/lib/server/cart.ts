import Cart from "@/src/entities/models/Cart";
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

const getCart = async (userId: string): Promise<SelectedItem[]> => {
    try {
        const cart = await Cart.find({ userId }).lean();
        return cart as unknown as SelectedItem[];
    } catch (error) {
        console.error("Error fetching cart:", error);
        throw new Error("Failed to fetch cart");
    }
};

export { getCart, postCart };
