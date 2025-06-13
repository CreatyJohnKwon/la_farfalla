"use client";

import ProductsList from "@src/widgets/list/ProductsList";
import { ShopClientProps } from "@src/entities/type/interfaces";
import { useEffect, useState } from "react";
import useProduct from "@src/shared/hooks/useProduct";

const ShopClient = ({ product }: ShopClientProps) => {
    const { section } = useProduct();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "auto" });

        if (product.length) setLoading(false);
    }, [section]);

    return (
        <div className="h-screen w-screen">
            <main className="flex h-full w-full flex-col items-center justify-center">
                <ul
                    className={`grid w-full grid-cols-2 gap-2 sm:gap-2 c_md:grid-cols-4 ${
                        !loading ? "animate-fade-in" : ""
                    }`}
                >
                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => (
                              <li
                                  key={i}
                                  className="aspect-square animate-pulse bg-neutral-100"
                              />
                          ))
                        : product.map((item, index) => {
                              if (item.key === +section || +section === 0) {
                                  return (
                                      <ProductsList
                                          key={item._id}
                                          product={item}
                                          index={index}
                                      />
                                  );
                              }
                          })}
                </ul>
            </main>
        </div>
    );
};

export default ShopClient;
