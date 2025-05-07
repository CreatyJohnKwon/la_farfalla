import { serialize } from "@/src/features/calculate";
import HomeClient from "./HomeClient";
import { Products } from "@/src/entities/type/interfaces";
import { getHome } from "@/src/shared/lib/server/get";

const Home = async () => {
    const productsRes = await getHome();
    const productsRaw: Products[] = serialize(productsRes) as Products[];

    return <HomeClient products={productsRaw} />;
};

export default Home;
