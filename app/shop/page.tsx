"use server";

import { getProductList } from "@/src/shared/lib/server/product";
import ShopClient from "./ShopClient";

const ShopPage = async () => {
    const productPage = await getProductList(1, 9, { isISR: true });
    return <ShopClient initialProducts={productPage.data} />;
}

export default ShopPage;
