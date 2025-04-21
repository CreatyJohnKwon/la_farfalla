import { serialize } from "@/src/features/calculate";
import HomeClient from "./HomeClient";
import { Products } from "@/src/entities/type/interfaces";
import { connectDB } from "@/src/entities/db/database";

const Home = async () => {
    const db = (await connectDB).db("forum");
    const productsRaw = await db.collection("shop").find({}).toArray();

    const products: Products[] = serialize(productsRaw) as Products[];

    return <HomeClient products={products} />;
};

export default Home;
