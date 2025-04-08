import { connectDB } from "@/app/utils/database";
import { Post } from "@/app/utils/types/interfaces";
import { ObjectId } from "mongodb";
import Image from "next/image";
import DefaultImage from "@/public/chill.png";
import useProduct from "@/app/utils/hooks/useProduct";
import Tags from "@/app/utils/layouts/Products/Tags";
import Navbar from "@/app/utils/layouts/Navbar/Navbar";

interface ProductsProps {
    params: Promise<{ id: string }>;
}

const Products = async ({ params }: ProductsProps) => {
    const { id } = await params;

    const db = (await connectDB).db("forum");
    const result = await db.collection("post").findOne({ _id: new ObjectId(id) }) as unknown as Post;

    const {
        priceResult,
        priceDiscount
    } = useProduct(result);

    return result && (
        <div className="flex flex-col items-center justify-center h-full w-full pb-24">
            <Navbar />
            <div className="w-full grid grid-cols-1 c_md:grid-cols-2 gap-2 transition-all duration-300 ease-in-out">
                <Image
                    src={result.image ? `${process.env.R2_FILE_DOMAIN}/${result.image}` : DefaultImage}
                    alt={result.title}
                    width={500}
                    height={500}
                    style={{ objectFit: "contain" }}
                    className="w-full c_base:w-3/4 h-auto rounded place-self-end"
                    priority
                />
                <div className="w-full h-full flex flex-col items-start justify-center p-5">
                    <div className="text-sm c_sm:text-base c_base:text-2xl font-semibold c_base:mt-9 mb-1 transition-all duration-700 ease-in-out">
                        <span>{`[${result.category}]\t${result.title}`}</span>
                    </div>
                    {
                        result.discount === "0" || !result.discount ? (
                            <span className="text-base c_base:text-4xl font-semibold">{`${priceResult()}원`}</span>
                        ) : (
                            <div>
                                <span className="text-sm  c_sm:text-base c_base:text-4xl font-semibold transition-all duration-700 ease-in-out">{`${priceDiscount()}원`}</span>
                                <span className="ms-1 c_base:ms-4 text-ms c_base:text-2xl font-sans text-gray-600 line-through transition-all duration-700 ease-in-out">{`${priceResult()}원`}</span>
                                <span className="ms-2 c_base:ms-4 text-base c_base:text-4xl font-semibold text-red-600 transition-all duration-700 ease-in-out">{`${result.discount}%`}</span>
                            </div>
                        )
                    }
                    <p className="text-gray-700 c_base:text-lg my-1">색상 종류: {`${result.colors}`}</p>
                    <p className="text-gray-400 my-1"><Tags post={result} /></p>

                    {/* 결제 */}
                    <div className="h-[100px] c_base:h-full w-full c_base:w-3/5 bg-red-50 hover:bg-red-200 items-center justify-center flex">
                        대충 여기다가 결제관련
                    </div>
                </div>
            </div>
            <div className="w-full c_base:w-2/4 mt-10">
                <Image 
                    src={result.image ? `${process.env.R2_FILE_DOMAIN}/${result.description}` : DefaultImage}
                    alt={"description Image"}
                    width={500}
                    height={500}
                    style={{ objectFit: "contain" }}
                    className="w-full h-full rounded-lg"
                    priority
                />
            </div>
        </div>
    )
}

export default Products;