"use server";

import { getProduct } from "@/src/shared/lib/server/product";
import ProductClient from "./ProductClient";

const ProductsPage = async ({ params }: { params: Promise<{ productId: string }> }) => {
    const { productId } = await params;

    const product = await getProduct(productId);

    if (!product) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <h2 className="text-xl font-pretendard">상품을 찾을 수 없습니다.</h2>
            </div>
        );
    }

    return <ProductClient productId={productId} product={product} />;
};

export default ProductsPage;
