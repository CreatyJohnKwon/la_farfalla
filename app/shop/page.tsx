"use client";

import useProduct from "@/src/shared/hooks/useProduct";
import { useProductListQuery } from "@/src/shared/hooks/react-query/useProductQuery";
import ProductsList from "@/src/widgets/list/ProductsList";

const Shop = () => {
    const { section } = useProduct();
    const { data: product, isLoading: productsLoading } = useProductListQuery();

    if (productsLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <ul className="grid w-full grid-cols-2 gap-2 sm:gap-2 md:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <li
                            key={i}
                            className="mb-32 hidden aspect-square animate-pulse bg-neutral-100 md:block"
                        />
                    ))}
                </ul>
            </div>
        );
    }

    return (
        product && (
            <div className="h-screen w-screen">
                <main className="flex h-full w-full flex-col items-center justify-center">
                    <ul className="grid w-full animate-fade-in grid-cols-2 gap-2 sm:gap-2 md:grid-cols-4">
                        {product
                            .filter(
                                (item) =>
                                    section === "" || item.seasonId === section,
                            )
                            .map((item, index) => (
                                <ProductsList
                                    key={item._id}
                                    product={item}
                                    index={index}
                                />
                            ))}
                    </ul>
                </main>
            </div>
        )
    );
};

export default Shop;
