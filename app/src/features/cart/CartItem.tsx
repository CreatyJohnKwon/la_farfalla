import { useEffect, useState } from "react";

const CartItem = ({ item } : { item : any }) => {
    const [product, setProduct] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            const res = await fetch(`/api/product?id=${item._id}`);
            const data = await res.json();
            setProduct(data);
        };
        fetchProduct();
    }, []);

    return (
        <>
            <p className="me-2">
                {item.color}-{item.size}
            </p>
            <p className="me-2">{item.quantity} 개</p>
            <p className="text-gray-600">
                {item.discountPrice} 원
            </p>
        </>
    )
}

export default CartItem;