"use client";

import useProduct from "@/src/shared/hooks/useProduct";
import { useProductListQuery } from "@/src/shared/hooks/react-query/useProductQuery";
import ProductsList from "@/src/widgets/list/ProductsList";

const Shop = () => {
    const { section } = useProduct();
    const { data: product, isLoading: productsLoading } = useProductListQuery();

    return (
        !productsLoading && product && (
            <div className="h-screen w-screen">
                <main className="flex h-full w-full flex-col items-center justify-center">
                    <ul className="grid w-[95vw] md:w-[92vw] animate-fade-in grid-cols-2 gap-2 sm:gap-2 md:grid-cols-3 md:mt-36 overflow-y-auto">
                        {product
                            .filter(
                                (item) =>
                                    section === "" ||
                                    item.seasonName === section,
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
