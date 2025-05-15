import { serialize } from "@/src/features/calculate";
import HomeClient from "./HomeClient";
import { Products } from "@/src/entities/type/interfaces";
import { getSeason } from "@/src/shared/lib/server/shop";

const Home = async () => {
    const productsRes = await getSeason();
    const productsRaw: Products[] = serialize(productsRes) as Products[];

    return <HomeClient products={productsRaw} />;
};

export default Home;
