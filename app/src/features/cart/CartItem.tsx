import { Posts, SelectedItem } from "@/src/entities/type/interfaces";
import Image from "next/image";
import DefaultImg from "../../../../public/images/chill.png";
import { useEffect, useState } from "react";

const CartItem = ({ item } : { item : SelectedItem }) => {
    const [product, setProduct] = useState<Posts | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            const res = await fetch(`/api/product?id=${item.productId}`);
            const data = await res.json();
            setProduct(data);
        };
        fetchProduct();
    }, []);

    return product ? (
        <div className="w-3/4 flex items-center justify-between text-[0.8em]">
            <Image 
                className="w-[3em]"
                alt={`${product.title}_img`}
                width={500}
                height={500}
                src={`https://pub-29feff62c6da44ea8503e0dc13db4217.r2.dev/${product.image}` || DefaultImg}
                objectFit="cover"
            />
            <p className="me-10 font-amstel">{`${item.color} - ${item.size}`}</p>
            <p className="text-black font-amstel me-2">{`KRW ${item.discountPrice.toLocaleString()}`}</p>
        </div>
    ) : (
        <div className="w-3/4 flex items-center justify-between animate-pulse text-[0.8em]">
            <div className="w-[3em] h-[3em] bg-gray-300 rounded-md" />
            <div className="w-24 h-4 bg-gray-300 rounded-md me-10" />
            <div className="w-20 h-4 bg-gray-300 rounded-md me-2" />
        </div>
    )
}

export default CartItem;