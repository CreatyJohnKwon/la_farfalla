import { connectDB } from "@/src/entities/database";
import ShopClient from "./ShopClient";
import useProduct from "@/src/shared/hooks/useProduct";
import { Post } from "@/src/entities/interfaces";

const Shop = async () => {
    const { serialize } = useProduct();

    const db = (await connectDB).db("forum");
    const postRaw = await db.collection("post").find({}).toArray();

    const posts: Post[] = serialize(postRaw) as Post[];

    return <ShopClient posts={posts} />;
};

export default Shop;
