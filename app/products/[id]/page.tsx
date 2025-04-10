import { connectDB } from "@/utils/context/database";
import { Post } from "@/utils/types/interfaces";
import { ObjectId } from "mongodb";
import Image from "next/image";
import DefaultImage from "../../../public/chill.png";
import useProduct from "@/utils/hooks/useProduct";
import Tags from "@/utils/layouts/Products/Tags";
import Navbar from "@/utils/layouts/Navbar/Navbar";

interface ProductsProps {
    params: Promise<{ id: string }>;
}

const Products = async ({ params }: ProductsProps) => {
    const { id } = await params;

    const db = (await connectDB).db("forum");
    const result = (await db
        .collection("post")
        .findOne({ _id: new ObjectId(id) })) as unknown as Post;

    const { priceResult, priceDiscount } = useProduct(result);

    return (
        result && (
            <div className="flex h-full w-full flex-col items-center justify-center pb-24">
                <Navbar />
                <div className="grid w-full grid-cols-1 gap-2 transition-all duration-300 ease-in-out md:grid-cols-2">
                    <Image
                        src={
                            result.image
                                ? `${process.env.R2_FILE_DOMAIN}/${result.image}`
                                : DefaultImage
                        }
                        alt={result.title}
                        width={500}
                        height={500}
                        style={{ objectFit: "contain" }}
                        className="h-full w-full place-self-end rounded md:w-3/4"
                        priority
                    />
                    <div className="flex h-full w-full flex-col items-start justify-center p-5">
                        <div className="mb-1 text-sm font-semibold transition-all duration-700 ease-in-out c_sm:text-base c_base:mt-9 md:text-2xl">
                            <span>{`[${result.category}]\t${result.title}`}</span>
                        </div>
                        {result.discount === "0" || !result.discount ? (
                            <span className="text-base font-semibold c_base:text-4xl">{`${priceResult()}원`}</span>
                        ) : (
                            <div>
                                <span className="text-sm font-semibold transition-all duration-700 ease-in-out c_sm:text-xl md:text-3xl">{`${priceDiscount()}원`}</span>
                                <span className="text-ms ms-1 font-sans text-gray-600 line-through transition-all duration-700 ease-in-out c_sm:text-base md:ms-4 md:text-xl">{`${priceResult()}원`}</span>
                                <span className="ms-2 text-base font-semibold text-red-600 transition-all duration-700 ease-in-out c_sm:text-xl md:ms-4 md:text-3xl">{`${result.discount}%`}</span>
                            </div>
                        )}
                        <p className="my-1 text-gray-700 c_base:text-lg">
                            색상 종류: {`${result.colors}`}
                        </p>
                        <p className="my-1 text-gray-400">
                            <Tags post={result} />
                        </p>

                        {/* 결제 */}
                        <div className="flex h-[100px] w-full items-center justify-center bg-red-50 hover:bg-red-200 c_base:h-full c_base:w-3/5">
                            대충 여기다가 결제관련
                        </div>
                    </div>
                </div>
                <div className="mt-10 w-full md:w-2/4">
                    <Image
                        src={
                            result.image
                                ? `${process.env.R2_FILE_DOMAIN}/${result.description}`
                                : DefaultImage
                        }
                        alt={"description Image"}
                        width={500}
                        height={500}
                        style={{ objectFit: "contain" }}
                        className="h-full w-full rounded-lg"
                        priority
                    />
                </div>
            </div>
        )
    );
};

export default Products;
