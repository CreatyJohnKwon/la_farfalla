import { useAtom } from "jotai";
import { useState } from "react";
import { cartDatasAtom, cartViewAtom } from "@src/shared/lib/atom";
import { SelectedItem } from "@src/entities/type/interfaces";
import { justDiscount } from "@src/features/calculate";
import { useRouter } from "next/navigation";
import { postCart, deleteCart, updateQuantity } from "../lib/server/cart";
import useUser from "@src/shared/hooks/useUsers";
import useOrder from "./useOrder";
import { Product } from "@src/entities/type/products";
import { v4 as uuidv4 } from "uuid";

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
    const { setOrderDatas } = useOrder();

    const handleAddToCart = async (selectedItem? : SelectedItem[]) => {
        const userEmail = session?.user?.email;
        if (!userEmail) return router.push("/login");

        try {
            await postCart(selectedItem || selectedItems);
            alert("장바구니에 담겼습니다.");

            setSelectedItems([]);
            setCartDatas([]);
        } catch (err) {
            console.error(err);
            alert("장바구니 저장 중 오류가 발생했습니다.");
        }
    };

    // 옵션 첫 선택
    const handleSelect = (size: string, color: string, additional: string, product: Product) => {
        const alreadyExists = selectedItems.find(
            (item) => item.size === size && item.color === color,
        );

        if (alreadyExists) return alert("이미 선택한 옵션입니다.");

        const newItem: SelectedItem = {
            userId: session?.user?.email || "",
            title: product.title.kr,
            cartItemId: uuidv4(),
            image: product.image[0],
            productId: product._id || "",
            size,
            color,
            additional,
            quantity: 1,
            discountPrice: justDiscount(product),
            originalPrice: parseInt(product.price),
        };

        setSelectedItems((prev) => [...prev, newItem]);

        // size, color selected initialization :  흐름 개선
        setSelectedSize("");
        setSelectedColor("");
    };

    const handleRouteProduct = (productId: string | undefined) => {
        router.push(`/products/${productId}`);
        setCartView(false);
    };

    const handleDeleteProduct = (ids: string | string[] | undefined) => {
        console.log(ids)
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
        if (newQty < 1) return;

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

    const handleBuy = (items: SelectedItem[]) => {
        setOrderDatas(items);
        router.push("/order");
    };

    const handleRemoveCartAll = () => {
        const ids = cartDatas
            .filter((item) => item._id) // _id가 있는 애들만
            .map((item) => item._id!.toString());
        deleteCart(ids); // 장바구니 전부 비우기
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
        handleBuy,
        handleSelect,
        handleAddToCart,
        handleDeleteProduct,
        handleRouteProduct,
        handleUpdateProduct,
        handleRemoveCartAll,
    };
};

export default useCart;
