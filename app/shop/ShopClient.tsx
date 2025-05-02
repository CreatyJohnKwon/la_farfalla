"use client";

import ProductsList from "@/src/components/list/ProductsList";
import SectionDrop from "@/src/components/drop/SectionDrop";
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
                    setTitle(+val.key === 0 ? "" : val.title),
            );

        if (posts.length) setLoading(false);
    }, [section]);

    return (
        <div className="h-full w-full pb-52">
            <Navbar />
            <div className="mx-auto c_md:w-full">
                <p className="w-full pt-14 pb-10 text-center font-brand text-2xl c_sm:text-4xl c_md:text-6xl">
                    {`${title} Products`}
                </p>
                <ul className="grid w-full grid-cols-2 gap-2 transition-all sm:gap-2 c_md:grid-cols-4">
                    {
                        loading ? (
                            Array.from({ length: 4 }).map((_, i) => 
                                <li
                                    key={i}
                                    className="mt-10 aspect-square animate-pulse bg-neutral-100"
                                />
                            )
                        ) : (
                            posts.map((post) => {
                                if (post.key === +section) {
                                    return <ProductsList key={post._id} posts={post} />;
                                } else if (+section === 0) {
                                    return <ProductsList key={post._id} posts={post} />;
                                }
                            })
                        )
                    }
                </ul>
            </div>
        </div>
    );
};

export default ShopClient;
