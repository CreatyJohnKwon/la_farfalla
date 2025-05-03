"use client";

import ProductsList from "@/src/components/list/ProductsList";
import SeasonDrop from "@/src/components/drop/SeasonDrop";
import Navbar from "@/src/widgets/navbar/Navbar";
import { ShopClientProps } from "@/src/entities/type/interfaces";
import { useEffect, useState } from "react";
import useSection from "@/src/shared/hooks/useSection";

const ShopClient = ({ posts }: ShopClientProps) => {
    const { section, category } = useSection();
    const [loading, setLoading] = useState<boolean>(true);
    const [title, setTitle] = useState("");

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "auto" });

        if (section)
            category?.map(
                (val) =>
                    val.key === section &&
                    setTitle(+val.key === 0 ? "" : `${val.title} `),
            );

        if (posts.length) setLoading(false);
    }, [section]);

    return (
        <div className="h-screen w-screen">
            <Navbar children={<SeasonDrop />} />
            <main className="font-brand flex h-full w-full flex-col items-center justify-center">
                <span className="text-6xl">{`${title}Products`}</span>
                <ul className="grid w-full grid-cols-2 gap-2 transition-all sm:gap-2 c_md:grid-cols-4">
                    {loading
                        ? Array.from({ length: 4 }).map((_, i) => (
                              <li
                                  key={i}
                                  className="aspect-square animate-pulse bg-neutral-100"
                              />
                          ))
                        : posts.map((post) => {
                              if (post.key === +section) {
                                  return (
                                      <ProductsList
                                          key={post._id}
                                          posts={post}
                                      />
                                  );
                              } else if (+section === 0) {
                                  return (
                                      <ProductsList
                                          key={post._id}
                                          posts={post}
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
