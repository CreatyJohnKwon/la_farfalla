import Link from "next/link";
import Image from "next/image";
import DefaultImage from "../../../../public/chill.png";
import { Post } from "@/utils/types/interfaces";
import useProduct from "@/utils/hooks/useProduct";
import Tags from "./Tags";

const ProductsList = ({ post }: { post: Post }) => {
    const { priceResult, priceDiscount } = useProduct(post);

    return (
        <>
            <li className="mb-24 h-full w-full" key={`${post._id}`}>
                <Link href={`/products/${post._id}`}>
                    <Image
                        src={
                            post.image
                                ? `https://pub-29feff62c6da44ea8503e0dc13db4217.r2.dev/${post.image}`
                                : DefaultImage
                        }
                        alt={post.title}
                        width={500}
                        height={500}
                        style={{ objectFit: "contain" }}
                        priority
                        className="h-auto w-full"
                    />
                    <div className="mb-1 mt-4 text-sm font-semibold transition-all duration-700 ease-in-out c_sm:text-base c_base:mt-9 c_base:text-2xl">
                        <span>{`[${post.category}]\t${post.title}\t${post.colors} colors`}</span>
                    </div>
                    <div className="mb-1">
                        <Tags post={post} />
                    </div>
                    {post.discount === "0" || !post.discount ? (
                        <span className="text-base font-semibold c_base:text-2xl">{`${priceResult()}원`}</span>
                    ) : (
                        <div>
                            <span className="text-sm font-semibold transition-all duration-700 ease-in-out c_sm:text-base c_base:text-2xl">{`${priceDiscount()}원`}</span>
                            <span className="ms-1 font-sans text-xs text-gray-600 line-through transition-all duration-700 ease-in-out c_base:ms-4 c_base:text-xl">{`${priceResult()}원`}</span>
                            <span className="ms-2 text-base font-semibold text-red-600 transition-all duration-700 ease-in-out c_base:ms-4 c_base:text-2xl">{`${post.discount}%`}</span>
                        </div>
                    )}
                </Link>
            </li>
        </>
    );
};

export default ProductsList;
