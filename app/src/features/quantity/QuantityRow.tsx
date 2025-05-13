import { Posts } from "@/src/entities/type/interfaces";
import { priceDiscount } from "@/src/features/calculate";

const QuantityRow = ({
    posts,
    count,
    setCount,
}: {
    posts: Posts;
    count: number;
    setCount: React.Dispatch<React.SetStateAction<number>>;
}) => {
    const increase = () => setCount((prev) => prev + 1);
    const decrease = () => setCount((prev) => (prev > 1 ? prev - 1 : 1));

    return (
        <div className="font-amstel grid w-3/4 grid-cols-4 items-center gap-4 text-black">
            {/* 상품명 */}
            <div className="col-span-2 truncate text-base">
                {posts.title.eg}
            </div>

            {/* 수량 */}
            <div className="flex items-center justify-center gap-2">
                <div className="w-8 bg-gray-200 py-1 text-center text-sm">
                    {count}
                </div>
                <button
                    className="w-8 bg-gray-200 py-1 text-center text-sm"
                    onClick={increase}
                >
                    +
                </button>
                <button
                    className="w-8 bg-gray-200 py-1 text-center text-sm"
                    onClick={decrease}
                >
                    −
                </button>
            </div>

            {/* 가격 */}
            <div className="text-right text-base">
                KRW {priceDiscount(posts).toLocaleString()}
            </div>
        </div>
    );
};

export default QuantityRow;
