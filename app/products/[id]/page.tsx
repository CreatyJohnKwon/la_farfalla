"use server";

import ProductClient from "./ProductClient";

const ProductsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return <ProductClient id={id} />;
};

export default ProductsPage;
