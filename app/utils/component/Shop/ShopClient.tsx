"use client";

import { useSearchParams } from "next/navigation";
import ProductsList from "@/utils/layouts/Products/ProductsList";
import Dropdown from "@/utils/component/Dropdown/Dropdown";
import Navbar from "@/utils/layouts/Navbar/Navbar";
import { ShopClientProps } from "@/utils/types/interfaces";
import { useEffect, useState } from "react";
import { menuData } from "@/utils/context/dummy";

const ShopClient = ({ posts }: ShopClientProps) => {
    const [title, setTitle] = useState("");

    const searchParams = useSearchParams();
    const value = searchParams.get("session");
    const datas = menuData[1].child;

    useEffect(() => {
        if (!value) return;

        const found = datas?.find((d) => d.query === value);
        if (found) {
            setTitle(found.text);
        }
    }, [value]);

    return (
        <div className="h-full w-screen pb-24">
            <Navbar children={<Dropdown />} />
            <p className="font-brand fixed w-screen text-center text-2xl c_sm:text-4xl c_md:text-6xl">
                {title} Product
            </p>
            <div className="container mx-auto mt-24 w-5/6 transition-all duration-300 ease-in-out c_base:px-4 c_base:py-8 c_md:w-4/6">
                <ul className="grid grid-cols-2 gap-2 transition-all duration-300 ease-in-out c_sm:gap-4 c_base:gap-12 c_md:grid-cols-3">
                    {posts.map((post) => (
                        <ProductsList key={post._id} post={post} />
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ShopClient;
