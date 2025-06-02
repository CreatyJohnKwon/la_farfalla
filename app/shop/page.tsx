import ShopClient from "./ShopClient";
import { serialize } from "@src/features/calculate";
import { Posts } from "@src/entities/type/interfaces";
import { getShopProducts } from "@src/shared/lib/server/shop";

const Shop = async () => {
    const shopData = await getShopProducts();
    const shopRaw: Posts[] = serialize(shopData) as Posts[];

    return <ShopClient posts={shopRaw} />;
};

export default Shop;
