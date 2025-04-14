import useProduct from "@/src/shared/hooks/useProduct";
import HomeClient from "./HomeClient";
import { Shop } from "@/src/entities/interfaces";
import { connectDB } from "@/src/entities/database";

const Home = async () => {
    const { serialize } = useProduct();

    const db = (await connectDB).db("forum");
    const shopRaw = await db.collection("shop").find({}).toArray();

    const shops: Shop[] = serialize(shopRaw) as Shop[];

    return <HomeClient shops={shops} />;
};

export default Home;
