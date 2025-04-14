import { connectDB } from "@/src/entities/database";
import { Post, ProductsProps } from "@/src/entities/interfaces";
import { ObjectId } from "mongodb";
import ProductsClient from "./ProductsClient";
import useProduct from "@/src/shared/hooks/useProduct";

const Products = async ({ params }: ProductsProps) => {
    const { id } = await params;
    const { serializeFindOne } = useProduct();

    const db = (await connectDB).db("forum");
    const rawPost = await db
        .collection("post")
        .findOne({ _id: new ObjectId(id) });

    if (!rawPost) return null;

    const post = serializeFindOne(rawPost) as Post;

    return <ProductsClient post={post} />;
};

export default Products;
