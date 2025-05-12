import { Posts } from "@/src/entities/type/interfaces";
import { priceDiscount } from "@/src/features/calculate";
import useProduct from "@/src/shared/hooks/useProduct";

const QuantityRow = ({ posts }: { posts: Posts }) => {
    const { count, increase, decrease } = useProduct();

    return (
        <div className="font-amstel flex items-center justify-between gap-4 text-black">
            <span className="text-base">{posts.title.eg}</span>

            <div className="flex items-center gap-2">
                <div className="w-10 bg-gray-200 px-3 py-2 text-center text-sm">
                    {count}
                </div>
                <button
                    className="w-10 bg-gray-200 px-3 py-2 text-sm"
                    onClick={increase}
                >
                    +
                </button>
                <button
                    className="w-10 bg-gray-200 px-3 py-2 text-sm"
                    onClick={decrease}
                >
                    −
                </button>
            </div>

            <span className="text-base">{`KRW ${priceDiscount(posts)}`}</span>
        </div>
    );
};

export default QuantityRow;
