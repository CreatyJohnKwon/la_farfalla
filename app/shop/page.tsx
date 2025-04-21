import { connectDB } from "@/src/entities/db/database";
import ShopClient from "./ShopClient";
import { serialize } from "@/src/features/calculate";
import { Posts } from "@/src/entities/type/interfaces";

const Shop = async () => {
    const db = (await connectDB).db("forum");
    const postRaw = await db.collection("post").find({}).toArray();

    const posts: Posts[] = serialize(postRaw) as Posts[];

    return <ShopClient posts={posts} />;
};

export default Shop;
