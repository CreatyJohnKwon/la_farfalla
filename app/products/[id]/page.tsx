import { connectDB } from "@/src/entities/database";
import { Post, ProductsProps } from "@/src/entities/interfaces";
import { ObjectId } from "mongodb";
import ProductsClient from "./ProductsClient";

const Products = async ({ params }: ProductsProps) => {
    const { id } = await params;

    const db = (await connectDB).db("forum");
    const result = (await db
        .collection("post")
        .findOne({ _id: new ObjectId(id) })) as unknown as Post;

    return <ProductsClient result={result}></ProductsClient>
};

export default Products;
