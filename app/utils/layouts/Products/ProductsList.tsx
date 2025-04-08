import Link from "next/link"
import Image from "next/image";
import DefaultImage from "@/public/chill.png";
import { Post } from "@/app/utils/types/interfaces";
import useProduct from "../../hooks/useProduct";
import Tags from "./Tags";

const ProductsList = ({ post }: { post: Post }) => {
    const {
        priceResult,
        priceDiscount
    } = useProduct(post);

    return (
        <>
            <li className="mb-24 h-full w-full" key={`${post._id}`}>
                <Link href={`/products/${post._id}`}>
                    <Image 
                        src={post.image ? `${process.env.R2_FILE_DOMAIN}/${post.image}` : DefaultImage}
                        alt={post.title}
                        width={500}
                        height={500}
                        objectFit="contain"
                        priority
                        className="w-full h-auto rounded"
                    />
                    <div className="text-sm c_sm:text-base c_base:text-2xl font-semibold mt-4 c_base:mt-9 mb-1 transition-all duration-700 ease-in-out">
                        <span>{`[${post.category}]\t${post.title}\t${post.colors} colors`}</span>
                    </div>
                    <div className="mb-1">
                        <Tags post={post} />
                    </div>
                    {
                        post.discount === "0" || !post.discount ? (
                            <span className="text-base c_base:text-2xl font-semibold">{`${priceResult()}원`}</span>
                        ) : (
                            <div>
                                <span className="text-sm  c_sm:text-base c_base:text-2xl font-semibold transition-all duration-700 ease-in-out">{`${priceDiscount()}원`}</span>
                                <span className="ms-1 c_base:ms-4 text-xs c_base:text-xl font-sans text-gray-600 line-through transition-all duration-700 ease-in-out">{`${priceResult()}원`}</span>
                                <span className="ms-2 c_base:ms-4 text-base c_base:text-2xl font-semibold text-red-600 transition-all duration-700 ease-in-out">{`${post.discount}%`}</span>
                            </div>
                        )
                    }
                </Link>
            </li>
        </>
    )
}

export default ProductsList;