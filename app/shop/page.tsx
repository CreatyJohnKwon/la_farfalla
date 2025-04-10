import { connectDB } from "@/utils/context/database";
import { Post } from "@/utils/types/interfaces";
import ShopClient from "@/utils/component/Shop/ShopClient";
import { Suspense } from "react";
import Image from "next/image";
import LoadingIcon from "../../public/chill.png";

const Shop = async () => {
    const db = (await connectDB).db("forum");
    let result = (await db
        .collection("post")
        .find({})
        .toArray()) as unknown as Post[];

    const cleanedResult = result.map((post) => ({
        ...post,
        _id: post._id.toString(),
    })) as Post[];

    return (
        <div>
            {/* Client Component는 Suspense로 감싸야 함 */}
            <Suspense
                fallback={
                    <div className="flex h-screen w-screen flex-col items-center justify-center">
                        <Image
                            src={LoadingIcon}
                            alt="loading_img"
                            width={500}
                            height={500}
                            className="top-50 fixed z-0 mb-10 blur-lg"
                            priority
                        />
                        <div className="z-10 h-auto">
                            <span className="font-brand h-full w-full justify-self-center text-3xl c_md:text-6xl">
                                Loading...
                            </span>
                        </div>
                    </div>
                }
            >
                <ShopClient posts={JSON.parse(JSON.stringify(result))} />
            </Suspense>
        </div>
    );
};

export default Shop;
