import { useAtom } from "jotai";
import { useState } from "react";
import { cartDatasAtom, cartViewAtom } from "@/src/shared/lib/atom";
import { Posts, SelectedItem } from "@/src/entities/type/interfaces";
import { justDiscount } from "@/src/features/calculate";
import { useRouter } from "next/navigation";
import { postCart, deleteCart, updateQuantity } from "../lib/server/cart";
import useUser from "@/src/shared/hooks/useUsers";

const useCart = () => {
    const [cartView, setCartView] = useAtom(cartViewAtom);
    const [cartDatas, setCartDatas] = useAtom(cartDatasAtom);

    const [count, setCount] = useState<number | 1>(1);
    const [result, setResult] = useState<string | "">("");
    const [selectedItems, setSelectedItems] = useState<SelectedItem[] | []>([]);
    const [selectedSize, setSelectedSize] = useState<string | "">("");
    const [selectedColor, setSelectedColor] = useState<string | "">("");
    const { session } = useUser();
    const router = useRouter();

    const handleAddToCart = async () => {
        const userEmail = session?.user?.email;
        if (!userEmail) return router.push("/login");

        try {
            await postCart(selectedItems);
            alert("장바구니에 담겼습니다.");
            // setSelectedItems initialization :  흐름 개선
            setSelectedItems([]);
            setCartDatas([]);
        } catch (err) {
            console.error(err);
            alert("장바구니 저장 중 오류가 발생했습니다.");
        }
    };

    // 옵션 첫 선택
    const handleSelect = (size: string, color: string, posts: Posts) => {
        const alreadyExists = selectedItems.find(
            (item) => item.size === size && item.color === color,
        );

        if (alreadyExists) return alert("이미 선택한 옵션입니다.");

        const newItem: SelectedItem = {
            userId: session?.user?.email,
            cartItemId: crypto.randomUUID(),
            productId: posts._id,
            size,
            color,
            quantity: 1,
            discountPrice: justDiscount(posts),
            originalPrice: parseInt(posts.price),
        };

        setSelectedItems((prev) => [...prev, newItem]);

        // size, color selected initialization :  흐름 개선
        setSelectedSize("");
        setSelectedColor("");
    };

    const handleRouteProduct = (productId: string) => {
        router.push(`/products/${productId}`);
        setCartView(false);
    };

    const handleDeleteProduct = (ids: string | string[] | undefined) => {
        if (!ids) return;

        if (!confirm("삭제하시겠습니까?")) return;

        const idArray = Array.isArray(ids) ? ids : [ids];

        setCartDatas((prev) =>
            prev.filter(
                (i) => typeof i._id === "string" && !idArray.includes(i._id!),
            ),
        );

        deleteCart(idArray);
    };

    const handleUpdateProduct = (newQty: number, item: SelectedItem) => {
        setCartDatas((prev) =>
            prev.map((i) =>
                i._id === item._id ? { ...i, quantity: newQty } : i,
            ),
        );

        updateQuantity({
            ...item,
            quantity: newQty,
        });
    };

    return {
        cartView,
        setCartView,
        count,
        setCount,
        result,
        setResult,
        selectedSize,
        setSelectedSize,
        selectedColor,
        setSelectedColor,
        selectedItems,
        setSelectedItems,
        cartDatas,
        setCartDatas,
        handleAddToCart,
        handleSelect,
        handleDeleteProduct,
        handleRouteProduct,
        handleUpdateProduct,
    };
};

export default useCart;
