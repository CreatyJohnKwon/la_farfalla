import ProductClient from "./ProductClient";

const Products = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    return <ProductClient id={id} />;
};

export default Products;
