import { IDProps, Posts } from "@src/entities/type/interfaces";
import ProductClient from "./ProductClient";
import { serializeFindOne } from "@src/features/calculate";
import { getProduct } from "@src/shared/lib/server/shop";

const Products = async ({ params }: IDProps) => {
    const { id } = await params;
    if (!id) return null;

    const productData = await getProduct(id);
    if (!productData) return null;

    const productRaw = serializeFindOne(productData as unknown as Posts);

    return <ProductClient posts={productRaw} />;
};

export default Products;
