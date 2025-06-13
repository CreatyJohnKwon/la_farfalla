import ShopClient from "./ShopClient";
import { serialize } from "@src/features/calculate";
import { Product } from "@src/entities/type/interfaces";
import { getShopProducts } from "@src/shared/lib/server/shop";

const Shop = async () => {
    const shopData = await getShopProducts();
    const shopRaw: Product[] = serialize(shopData) as Product[];

    return <ShopClient product={shopRaw} />;
};

export default Shop;
