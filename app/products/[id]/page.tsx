import { connectDB } from "@/src/entities/db/database";
import { Posts, ProductsProps } from "@/src/entities/type/interfaces";
import { ObjectId } from "mongodb";
import ProductsClient from "./ProductsClient";
import { serializeFindOne } from "@/src/features/calculate";

const Products = async ({ params }: ProductsProps) => {
    const { id } = await params;

    const db = (await connectDB).db("forum");
    const rawPost = await db
        .collection("post")
        .findOne({ _id: new ObjectId(id) });

    if (!rawPost) return null;

    const post = serializeFindOne(rawPost) as Posts;

    return <ProductsClient posts={post} />;
};

export default Products;
