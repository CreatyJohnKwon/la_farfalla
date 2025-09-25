"use client";

import { useState, useEffect, useRef, Ref } from "react";
import ProductInfo from "@src/components/product/ProductInfo";
import Slider from "@src/components/product/Slider";
import { useProductQuery } from "@src/shared/hooks/react-query/useProductQuery";
import { useIntersectionObserver } from "@src/shared/hooks/useIntersectionObserver";
import DescriptionImage from "@src/components/product/DescriptionImage";
import ReviewSystem from "@src/components/review/ReviewSystem";
import LoadingSpinner from "@src/widgets/spinner/LoadingSpinner";
import { useGetReviewsListQuery } from "@src/shared/hooks/react-query/useReviewQuery";
import { productTabs } from "@/src/utils/dataUtils";

const ProductClient = ({ id }: { id: string }) => {
    const {
        data: product,
        isLoading: productLoading,
        error,
    } = useProductQuery(id);
    const {
        data: reviewsData,
        isLoading: reviewIsLoading,
        error: reviewError,
        refetch: reviewRefetch,
    } = useGetReviewsListQuery(id);
    const [visibleImages, setVisibleImages] = useState<Set<number>>(
        new Set([0, 1]),
    ); // 처음 2개는 기본으로 보이게
    const [activeTab, setActiveTab] = useState("description");
    const [needsToggle, setNeedsToggle] = useState(false);
    const descriptionRef = useRef<HTMLDivElement>(null);

    const reviews = reviewsData?.data || [];
    const imgsOnly: string[] = reviewsData?.imagesOnly || [];

    // 콘텐츠 높이 체크 함수
    const checkContentHeight = () => {
        if (descriptionRef.current) {
            const contentHeight = descriptionRef.current.scrollHeight;
            setNeedsToggle(contentHeight > 500);
        }
    };

    // Description 섹션 Intersection Observer
    const { ref: descriptionSectionRef, isVisible: isDescriptionVisible } =
        useIntersectionObserver({
            threshold: 0.1,
            rootMargin: "100px",
        });

    // 이미지 프리로드 (상품 로딩 완료 후)
    useEffect(() => {
        if (product && !productLoading && product.description?.images) {
            // 첫 번째 이미지 즉시 프리로드
            const firstImage = product.description.images[0];
            if (firstImage) {
                const img = new window.Image();
                img.src = firstImage;
            }

            const timer = setTimeout(checkContentHeight, 300);
            return () => clearTimeout(timer);
        }
    }, [product, productLoading]);

    // Description이 보일 때 추가 이미지들 프리로드
    useEffect(() => {
        if (isDescriptionVisible && product?.description?.images) {
            const imagesToPreload = product.description.images.slice(0, 3); // 처음 3개
            imagesToPreload.forEach((src, index) => {
                if (src) {
                    const img = new window.Image();
                    // R2 최적화 적용
                    if (src.includes("r2.dev")) {
                        try {
                            const url = new URL(src);
                            url.searchParams.set("width", "800");
                            url.searchParams.set("quality", "85");
                            url.searchParams.set("format", "webp");
                            img.src = url.toString();
                        } catch {
                            img.src = src;
                        }
                    } else {
                        img.src = src;
                    }

                    img.onload = () => {
                        setVisibleImages((prev) => new Set([...prev, index]));
                    };
                }
            });
        }
    }, [isDescriptionVisible, product?.description?.images]);

    // ID가 없는 경우
    if (!id) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-pretendard text-red-600">
                        접근 권한 실패 | 상품 ID 없음
                    </h2>
                </div>
            </div>
        );
    }

    // 에러 발생
    if (error) {
        return (
            <div className="flex h-screen w-full font-pretendard items-center justify-center">
                <div className="text-center">
                    <h2 className="mb-2 text-xl text-red-600">
                        에러 발생 | {String(error)}
                    </h2>
                    <p className="text-gray-600">{String(error)}</p>
                    <p className="mt-2 text-sm text-gray-500">
                        상품 ID: {id}
                    </p>
                </div>
            </div>
        );
    }

    // 로딩 중
    if (productLoading) {
        return <LoadingSpinner size="md" message="Loading..." />;
    }

    // 상품 데이터가 없는 경우
    if (!product) {
        return (
            <div className="flex h-screen w-full font-pretendard items-center justify-center">
                <div className="text-center">
                    <h2 className="mb-2 text-xl text-gray-700">
                        상품 데이터가 없습니다
                    </h2>
                    <p className="text-gray-600">상품 ID: {id}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col items-center justify-center overflow-x-hidden">
            <div className="mx-auto mt-16 flex h-full w-full flex-col items-center gap-3 pb-[15vh] transition-all duration-300 ease-in-out sm:mt-24 md:mt-32 md:w-[90%] md:flex-row md:gap-8 lg:mt-32 lg:w-[70%] lg:gap-16">
                <Slider images={product.image} />
                <ProductInfo product={product} />
            </div>

            <div className="mx-auto w-full max-w-4xl">
                {/* 탭 헤더 */}
                <div className="relative border-b">
                    <nav className="relative flex space-x-8 px-6 font-pretendard font-[500]">
                        {productTabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`border-b-2 px-1 py-4 text-sm transition-colors duration-200 ${
                                    activeTab === tab.id
                                        ? "border-gray-900 text-gray-900"
                                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                }`}
                            >
                                {tab.label}
                                {tab.id === "reviews" &&
                                    reviews &&
                                    reviews.length > 0 && (
                                        <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                            {reviews && reviews.length}
                                        </span>
                                    )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* 탭 콘텐츠 */}
                <div className="min-h-[500px] w-full">
                    {activeTab === "description" && (
                        <div className="flex h-full w-full flex-col items-center">
                            <div
                                ref={
                                    descriptionSectionRef as Ref<HTMLDivElement | null>
                                }
                                className="h-auto w-full md:w-3/5 mt-20"
                            >
                                <DescriptionImage
                                    product={product}
                                    visibleImages={visibleImages}
                                    setVisibleImages={setVisibleImages}
                                    checkContentHeight={checkContentHeight}
                                    descriptionRef={descriptionRef}
                                    needsToggle={needsToggle}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === "reviews" && (
                        <div className="w-full">
                            <ReviewSystem
                                productId={id}
                                reviews={reviews}
                                isLoading={reviewIsLoading}
                                error={reviewError}
                                refetch={reviewRefetch}
                                imgsOnly={imgsOnly}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductClient;
