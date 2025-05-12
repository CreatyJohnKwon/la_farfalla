import {
    priceResult,
    priceDiscount,
    justDiscount,
} from "@/src/features/calculate";
import { Posts } from "@/src/entities/type/interfaces";
import SizeDrop from "@/src/widgets/drop/SizeDrop";
import QuantityRow from "@/src/widgets/quantity/QuantityRow";
import useProduct from "@/src/shared/hooks/useProduct";
import { useEffect, useState } from "react";

const ProductInfo = ({ posts }: { posts: Posts }) => {
    const { count } = useProduct();
    const [result, setResult] = useState<string>(priceDiscount(posts));

    useEffect(() => {
        const temp = justDiscount(posts) * count;
        setResult(temp.toLocaleString());
    }, [count]);

    return (
        <div className="mt-5 flex h-full w-full flex-col items-center justify-center gap-6 md:col-span-1 md:mt-0">
            {/* title */}
            <div className="flex flex-row items-center">
                <span className="font-amstel text-[1.7em]">
                    {posts.title.eg}
                </span>
                <span className="ms-10 font-pretendard text-[1em]">
                    {posts.title.kr}
                </span>
            </div>

            {/* Description text */}
            <span className="w-4/6 text-center font-pretendard text-[0.8em] font-[300]">
                {posts.description.text}
            </span>

            {/* price */}
            {posts.discount === "0" || !posts.discount ? (
                <div className="font-amstel text-[1em]">{`KRW ${priceResult(posts)}`}</div>
            ) : (
                <>
                    <div className="font-amstel text-[1em]">
                        <span className="pe-2">{`${posts.discount}%`}</span>
                        <span className="font-amstel-thin text-gray-500 line-through">{`KRW ${priceResult(posts)}`}</span>
                    </div>
                    <span className="font-amstel -mt-2 text-[1em] text-black">{`KRW ${priceDiscount(posts)}`}</span>
                </>
            )}

            {/* size drop */}
            <div className="w-4/5 md:w-3/4">
                <SizeDrop size={posts.size} />
            </div>

            {/* 상품 추가 */}
            <QuantityRow posts={posts} />

            <div className="flex w-3/4 items-center justify-end text-center text-black">
                <span className="me-1 font-pretendard font-[300]">
                    총 상품금액(수량) :
                </span>
                <span className="font-amstel mb-2 text-[2.2em]">{result}</span>
                <span className="ms-2 font-pretendard font-[300]">
                    {`(${count}개)`}
                </span>
            </div>

            <div className="font-amstel-thin h-24 w-3/4 bg-red-100 text-center text-black">
                <span>naver payments</span>
            </div>

            <div className="font-amstel flex w-3/4 justify-between gap-14">
                <button className="w-1/2 bg-gray-200 py-5 text-center text-base text-black hover:bg-gray-300">
                    buy now
                </button>
                <button className="w-1/2 bg-gray-200 py-5 text-center text-base text-black hover:bg-gray-300">
                    cart
                </button>
            </div>
        </div>
    );
};

export default ProductInfo;
