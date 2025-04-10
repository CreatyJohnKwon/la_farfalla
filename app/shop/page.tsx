import { connectDB } from "@/utils/context/database";
import { Post } from "@/utils/types/interfaces";
import ShopClient from "@/utils/component/Shop/ShopClient";

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

    return <ShopClient posts={cleanedResult} />;
};

export default Shop;
