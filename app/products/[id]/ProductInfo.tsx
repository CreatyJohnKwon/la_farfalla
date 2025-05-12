import { priceResult, priceDiscount } from "@/src/features/calculate";
import { Posts } from "@/src/entities/type/interfaces";
import SizeDrop from "@/src/widgets/drop/SizeDrop";

const ProductInfo = ({ posts }: { posts: Posts }) => {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-5 md:col-span-1">
            {/* title */}
            <div className="flex flex-row items-center">
                <span className="font-amstel text-[1.7em]">English Title</span>
                <span className="ms-10 font-pretendard text-[1em]">
                    {posts.title}
                </span>
            </div>

            {/* Description text */}
            <div className="w-4/6 text-center font-pretendard text-[0.8em] font-[300]">
                <p>{posts.description.text}</p>
            </div>

            {/* price */}
            <div className="font-amstel">{`KRW ${priceDiscount(posts)}`}</div>

            {/* size drop */}
            <div className="w-3/4">
                <SizeDrop size={posts.size} />
            </div>

            <div className="w-3/4 text-center">ㅁㄴㅇ</div>
        </div>
    );
};

export default ProductInfo;
