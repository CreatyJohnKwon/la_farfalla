import { getProduct } from "@/src/shared/lib/server/product";
import ProductClient from "./ProductClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ productNm: string, productId: string }> }): Promise<Metadata> {
    const { productId } = await params;
    const product = await getProduct(productId);

    if (!product) {
        return {
            title: "상품을 찾을 수 없음"
        };
    }

    const pageTitle = product.title.eg.toUpperCase();
    const pageDescription = `${product.title.kr}에 대한 상세 정보입니다.`;
    const imageUrl = product.image[0] || '/default-image.jpg';

    return {
        title: pageTitle,
        openGraph: {
            title: pageTitle,
            description: pageDescription,
            images: [
                {
                    url: imageUrl,
                    width: 800,
                    height: 600,
                },
            ],
            siteName: '내 멋진 쇼핑몰',
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