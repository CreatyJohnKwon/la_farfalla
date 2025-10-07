import { getProduct } from "@/src/shared/lib/server/product";
import ProductClient from "./ProductClient";
import { Metadata } from "next";

// 1. params 타입에 productNm 추가
export async function generateMetadata({ params }: { params: Promise<{ productNm: string, productId: string }> }): Promise<Metadata> {
    const { productId } = await params; // productNm은 사용하지 않더라도 받아야 합니다.
    const product = await getProduct(productId);

    if (!product) {
        return {
            title: "상품을 찾을 수 없음"
        };
    }

    return {
        title: product.title.eg.toUpperCase(),
        description: `${product.title.kr}에 대한 상세 정보입니다.`,
        openGraph: {
            title: product.title.eg.toUpperCase(),
            description: `${product.title.kr}에 대한 상세 정보입니다.`,
            images: [product.image[0] || '/default-image.jpg'],
        },
    };
}

// 2. 여기도 마찬가지로 params 타입에 productNm 추가
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