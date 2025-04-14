import { connectDB } from "@/src/entities/database";
import { Post } from "@/src/entities/interfaces";
import ShopClient from "./ShopClient";

const Shop = async () => {
    const db = (await connectDB).db("forum");
    let result = (await db
        .collection("post")
        .find({})
        .toArray()) as unknown as Post[];

    return <ShopClient posts={JSON.parse(JSON.stringify(result))} />;
};

export default Shop;
