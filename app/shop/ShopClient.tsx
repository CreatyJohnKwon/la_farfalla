"use client";

import ProductsList from "@/src/features/Products/ProductsList";
import SectionDrop from "@/src/features/Dropdown/SectionDrop";
import Navbar from "@/src/widgets/Navbar/Navbar";
import { ShopClientProps } from "@/src/entities/interfaces";
import { useEffect, useState } from "react";
import useSection from "@/src/shared/hooks/useSection";

const ShopClient = ({ posts }: ShopClientProps) => {
    const { section, category } = useSection();
    const [loading, setLoading] = useState<boolean>(true);
    const [title, setTitle] = useState("");

    useEffect(() => {
        console.log("asdasd");
        if (section)
            category?.map(
                (val) =>
                    val.key === section &&
                    setTitle(+val.key === 0 ? "" : val.title),
            );

        if (posts.length) setLoading(false);
    }, [section]);

    return loading ? (
        <div className="h-full w-full">
            <Navbar children={<SectionDrop />} />
            <div className="container mx-auto mt-24 w-5/6 transition-all duration-300 ease-in-out c_base:px-4 c_base:py-8 c_md:w-4/6">
                <p className="font-brand w-full p-10 text-center text-2xl c_sm:text-4xl c_md:text-6xl">
                    {`${title} Products`}
                </p>
                <ul className="grid grid-cols-2 gap-2 transition-all duration-300 ease-in-out c_sm:gap-4 c_base:gap-12 c_md:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <li
                            key={i}
                            className="mb-[265px] aspect-square animate-pulse bg-neutral-200 dark:bg-neutral-700"
                        />
                    ))}
                </ul>
            </div>
        </div>
    ) : (
        <div className="h-full w-full">
            <Navbar children={<SectionDrop />} />
            <div className="container mx-auto w-5/6 transition-all duration-300 ease-in-out c_base:px-4 c_base:py-8 c_md:w-4/6">
                <p className="font-brand w-full p-10 text-center text-2xl c_sm:text-4xl c_md:text-6xl">
                    {`${title} Products`}
                </p>
                <ul className="grid grid-cols-2 gap-2 transition-all duration-300 ease-in-out c_sm:gap-4 c_base:gap-12 c_md:grid-cols-3">
                    {posts.map((post) => {
                        if (post.key === +section) {
                            return <ProductsList key={post._id} post={post} />;
                        } else if (+section === 0) {
                            return <ProductsList key={post._id} post={post} />;
                        }
                    })}
                </ul>
            </div>
        </div>
    );
};

export default ShopClient;
