import { getProduct } from "@/src/shared/lib/server/product";
import ProductClient from "./ProductClient";
import { Metadata } from "next";
import DefaultImg from "../../../../public/images/default_logo.png";
import { Product } from "@/src/entities/type/products";
import { baseUrl } from "../../../../public/data/common";

export async function generateMetadata({ params }: { params: Promise<{ productNm: string, productId: string }> }): Promise<Metadata> {
    const { productId, productNm } = await params;
    const product: Product = await getProduct(productId);

    if (!product) {
        return {
            title: "상품을 찾을 수 없음"
        };
    }

    const pageTitle = product.title.eg.toUpperCase();
    const pageDescription = product.description.text;
    const imageUrl = product.image[0] || DefaultImg.toString();

    return {
        title: pageTitle,
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            url: `${baseUrl}/products/${productNm}/${productId}`,
            images: [{ url: imageUrl }],
            siteName: 'La farfalla',
        },
    };
}

export default async function ProductsPage({ params }: { params: Promise<{ productNm: string, productId: string }> }) {
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
}