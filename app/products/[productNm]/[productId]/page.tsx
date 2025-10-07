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

    const pageTitle = product.title.eg.toUpperCase(); // "MY AWESOME LAPTOP"
    const pageDescription = `${product.title.kr}에 대한 상세 정보입니다.`;
    const imageUrl = product.image[0] || '/default-image.jpg';

    return {
        // 이 title은 브라우저 탭에 표시됩니다.
        title: pageTitle,

        // ⭐️ 여기가 핵심입니다!
        // openGraph 객체는 인스타그램, 카카오톡, 페이스북 등 소셜 미디어 미리보기를 제어합니다.
        openGraph: {
            // ✅ 인스타그램 스토리 스티커에 표시될 제목
            title: pageTitle,
            
            // 미리보기에 함께 표시될 설명
            description: pageDescription,
            
            // 미리보기 이미지 (매우 중요)
            images: [
                {
                    url: imageUrl,
                    width: 800,
                    height: 600,
                },
            ],

            // 브랜드 일관성을 위해 사이트 이름을 명시해주는 것이 좋습니다.
            siteName: '내 멋진 쇼핑몰',
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