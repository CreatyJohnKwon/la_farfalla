"use client";

import {
    priceResult,
    priceDiscount,
    justDiscount,
} from "@src/features/calculate";
import ProductDrop from "@src/widgets/drop/ProductDrop";
import QuantityModal from "@src/widgets/modal/QuantityModal";
import { useEffect, useMemo, useState } from "react";
import useCart from "@src/shared/hooks/useCart";
import useUser from "@src/shared/hooks/useUsers";
import { Product, ProductVariant } from "./interface";
import { SelectedItem } from "@/src/entities/type/interfaces";
import { AdditionalOption } from "@/src/widgets/modal/interface";

// SVG 아이콘 컴포넌트들
const ShareIcon = ({ className = "" }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
        />
    </svg>
);

const CheckIcon = ({ className = "" }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
        />
    </svg>
);

const ProductInfo = ({ product }: { product: Product }) => {
    const { selectedItems, setSelectedItems, handleBuy, handleAddToCart } = useCart();
    const [count, setCount] = useState(0);
    const [result, setResult] = useState("0");
    const [activeTab, setActiveTab] = useState(null);
    const [shareStatus, setShareStatus] = useState("");

    // ✅ 1. 상태 선언 수정: string 대신 객체(Object) 또는 null을 저장하도록 변경
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<ProductVariant | null>(null);
    const [selectedAdditional, setSelectedAdditional] = useState<AdditionalOption | null>(null);

    const { authCheck, session } = useUser();

    const handleAddProductItem = (size: string, colorOption: ProductVariant) => {
        const color = colorOption.colorName;
        const cartItemId = `${product._id}-${size}-${color}`;

        const existingItem = selectedItems.find(item => item.cartItemId === cartItemId);
        if (existingItem) {
            alert("이미 선택한 옵션입니다.");
            setSelectedSize(null);
            setSelectedColor(null);
            return;
        }

        const newItem: SelectedItem = {
            cartItemId,
            productId: product._id || "",
            image: product.image[0],
            quantity: 1,
            userId: authCheck() ? session?.user.id : null,
            title: product.title.kr,
            size: size,
            color: color,
            additional: "",
            originalPrice: Number(product.price),
            discountPrice: justDiscount(product),
        };

        setSelectedItems(prev => [...prev, newItem]);
        setSelectedSize(null);
        setSelectedColor(null);
    };

    const handleAddAdditionalItem = (optionData: AdditionalOption) => {
        if (!optionData) return;
        const cartItemId = `${product._id}-additional-${optionData.name}`;

        const existingItem = selectedItems.find(item => item.cartItemId === cartItemId);
        if (existingItem) {
            alert("이미 선택한 옵션입니다.");
            setSelectedAdditional(null);
            return;
        }
        
        const newItem: SelectedItem = {
            cartItemId,
            productId: product._id || "",
            image: product.image[0],
            quantity: 1,
            userId: authCheck() ? session?.user.id : null,
            title: product.title.kr,
            size: "",
            color: "",
            additional: optionData.name,
            originalPrice: optionData.additionalPrice || 0,
            discountPrice: optionData.additionalPrice || 0,
        };
        
        setSelectedItems(prev => [...prev, newItem]);
        setSelectedAdditional(null);
    };

    const colorOptionsForDropdown = useMemo(() => {
        // product.options가 없으면 빈 배열을 반환합니다.
        if (!product.options) {
            return [];
        }
        // 각 option 객체에 클라이언트 전용 id를 추가합니다.
        return product.options.map((option, index) => ({
            ...option,
            id: `${product._id}-color-${option.colorName}-${index}`, // 고유한 id 생성
        }));
    }, [product.options, product._id]);

    const toggleTab = (tabName: any) => setActiveTab(activeTab === tabName ? null : tabName);

    // 공유하기 기능
    const handleShare = async () => {
        const shareData = {
            title: `${product.title.kr} - ${product.title.eg}`,
            text: product.description.text,
            url: window.location.href,
        };

        try {
            // Web Share API 지원 확인
            if (navigator.share) {
                await navigator.share(shareData);
                setShareStatus("shared");
            } else {
                // Web Share API를 지원하지 않는 경우 클립보드에 복사
                await navigator.clipboard.writeText(
                    `${shareData.title}\n${shareData.text}\n${shareData.url}`,
                );
                setShareStatus("copied");
            }

            // 2초 후 상태 초기화
            setTimeout(() => setShareStatus(""), 2000);
        } catch (error) {
            console.error("공유 실패:", error);
            // 클립보드 복사도 실패한 경우 URL만 복사 시도
            try {
                await navigator.clipboard.writeText(window.location.href);
                setShareStatus("copied");
                setTimeout(() => setShareStatus(""), 2000);
            } catch (clipboardError) {
                console.error("클립보드 복사 실패:", clipboardError);
            }
        }
    };

    useEffect(() => {
        if (selectedSize && selectedColor) {
            handleAddProductItem(selectedSize, selectedColor);
        }
    }, [selectedSize, selectedColor]);

    useEffect(() => {
        if (selectedAdditional) {
            handleAddAdditionalItem(selectedAdditional);
        }
    }, [selectedAdditional]);

    useEffect(() => {
        const totalQuantity = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = selectedItems.reduce((sum, item) => sum + (item.discountPrice * item.quantity), 0);
        
        setCount(totalQuantity);
        setResult(totalPrice.toLocaleString());
    }, [selectedItems]);

    const detailsContent = (
        <div className="p-4 font-pretendard text-[0.9rem] font-[200] text-black sm:mt-2">
            {product.description.detail
                ? product.description.detail
                : "상품에 대한 자세한 설명이 없습니다."}
        </div>
    );

    const deliveryContent = (
        <div className="w-8/11 flex flex-col gap-2 place-self-center p-4 font-pretendard text-xs text-black sm:mt-2 sm:text-[0.9rem]">
            <span className="font-[200] leading-relaxed">
                주문 확인 후 최대 7일 이내 제공 완료됩니다.
            </span>
            <span className="font-[100] leading-relaxed">
                * 택배사 사정에 따라 공휴일과 주말 제외
            </span>
        </div>
    );

    const shippingContent = (
        <div className="w-8/11 flex flex-col gap-2 place-self-center p-4 font-pretendard text-xs font-[200] text-black sm:mt-2 sm:text-[0.9rem]">
            <span className="leading-relaxed">
                고객님의 만족스러운 쇼핑을 위해 다음과 같은 교환·반품 정책을
                운영합니다.
            </span>
            <span className="leading-relaxed">
                1. 교환/반품 가능 기간
                <br />
                <span className="font-[100]">
                    - 상품 수령일로부터 7일 이내 신청 가능합니다.
                    <br />- 단순변심으로 인한 접수는 24시간 이내 C/S(카카오톡
                    채널톡)으로 접수 바랍니다.
                </span>
            </span>
            <span className="leading-relaxed">
                2. 교환/반품이 불가능한 경우
                <br />
                <span className="font-[100]">
                    - 상품의 라벨이 훼손됐거나, 세탁한 경우
                    <br />- 상품의 가치가 현저히 감소한 경우(오염, 사용 흔적,
                    향수 냄새 등)
                </span>
            </span>
            <span className="leading-relaxed">
                3. 교환/반품 절차
                <br />
                <span className="font-[100]">
                    - [카카오톡 채널톡] 으로 접수 바랍니다.
                    <br />- 단순 변심의 경우 왕복 택배비 6,000원이 발생됩니다.
                </span>
            </span>
            <span className="leading-relaxed">
                4. 환불 안내
                <br />
                <span className="font-[100]">
                    - 반품 상품 수령 및 검수 후, 3영업일 이내 환불이 진행됩니다.
                    <br />- 결제 수단별 환불 소요 시간은 다를 수 있으며, 카드사
                    정책에 따라 3~7일이 소요될 수 있습니다.
                </span>
            </span>
        </div>
    );

    return (
        <div className="w-full md:w-1/2">
            <div className="mt-3 flex h-full flex-col items-center justify-center md:mt-0 gap-5 xl:gap-5">
                {/* title with share button */}
                <div className="flex flex-col items-center gap-2 text-center md:gap-3 lg:gap-4 xl:gap-5">
                    <div className="relative w-full max-w-[90vw] md:max-w-none">
                        <h1 className="font-amstel pr-10 text-2xl md:pr-16 md:text-3xl xl:text-4xl">
                            {product.title.eg}
                        </h1>

                        {/* 공유하기 버튼 - 안정화된 위치 */}
                        <button
                            onClick={handleShare}
                            className="group absolute right-0 top-1 rounded-full p-2 transition-all duration-200 hover:bg-gray-100 md:p-3"
                            title="공유하기"
                            aria-label="상품 공유하기"
                        >
                            {shareStatus === "copied" ||
                                shareStatus === "shared" ? (
                                    <CheckIcon className="h-4 w-4 text-gray-900 md:h-5 md:w-5 lg:h-6 lg:w-6" />
                                ) : (
                                    <ShareIcon className="h-4 w-4 text-gray-600 transition-colors group-hover:text-black md:h-5 md:w-5 lg:h-6 lg:w-6" />
                                )}
                        </button>

                        {/* 공유 상태 메시지 - 반응형 위치 */}
                        {shareStatus && (
                            <div className="absolute right-0 top-full z-10 mt-2 whitespace-nowrap rounded bg-black px-3 py-1 text-xs text-white shadow-lg md:text-sm">
                                {shareStatus === "copied"
                                    ? "링크가 복사되었습니다"
                                    : "공유되었습니다"}
                                <div className="absolute -top-1 right-4 h-2 w-2 rotate-45 bg-black"></div>
                            </div>
                        )}
                    </div>

                    <span className="-mt-1 font-pretendard text-lg font-[300] md:text-xl xl:text-2xl">
                        {product.title.kr}
                    </span>
                </div>

                {/* Description text */}
                <span className="w-full px-2 text-center font-pretendard text-sm font-[200] xl:text-base whitespace-pre-line">
                    {product.description.text}
                </span>

                {/* price */}
                {product.discount === "0" || !product.discount ? (
                    <div className="font-amstel text-lg md:text-xl">{`KRW ${priceResult(product)}`}</div>
                ) : (
                    <>
                        <div className="font-amstel text-base md:text-lg">
                            <span className="pe-2">{`${product.discount}%`}</span>
                            <span className="font-amstel-thin text-gray-500 line-through">{`KRW ${priceResult(product)}`}</span>
                        </div>
                        <span className="font-amstel -mt-1 text-base text-black md:-mt-2 md:text-lg">{`KRW ${priceDiscount(product)}`}</span>
                    </>
                )}

                {/* options drop */}
                <div className="flex w-full flex-col gap-2 px-2 md:w-4/5 md:gap-3 md:px-0 lg:w-9/12">
                    <ProductDrop
                        title={"size"}
                        items={product.size}
                        selected={selectedSize}
                        setSelected={setSelectedSize}
                        type="size"
                    />
                    <ProductDrop
                        title={"color"}
                        items={colorOptionsForDropdown}
                        selected={selectedColor}
                        setSelected={setSelectedColor}
                        type="color"
                    />
                    {product.additionalOptions && product.additionalOptions.length > 0 &&
                        <ProductDrop
                            title={"additional"}
                            items={product.additionalOptions || []}
                            selected={selectedAdditional}
                            setSelected={setSelectedAdditional}
                            type="additional"
                        />
                    }
                </div>

                {/* 상품 추가 */}
                {selectedItems.map((item: SelectedItem) => (
                    <QuantityModal
                        id={item.cartItemId}
                        custom="w-full text-sm md:text-base flex items-center justify-end gap-2 md:gap-4 text-black c_md:gap-6 px-2 md:px-0"
                        key={item.cartItemId}
                        item={item}
                        onDelete={(id) => {
                            setSelectedItems((prev) =>
                                prev.filter((i) => i.cartItemId !== id),
                            );
                        }}
                        updateQuantity={(newQty) => {
                            setSelectedItems((prev) =>
                                prev.map((i) =>
                                    i.cartItemId === item.cartItemId
                                        ? { ...i, quantity: newQty }
                                        : i,
                                ),
                            );
                        }}
                    />
                ))}

                {selectedItems.length > 0 ? (
                    <div className="flex w-full items-center justify-end px-2 text-center text-black md:px-0">
                        <span className="me-1 font-pretendard text-xs font-[300] md:text-sm lg:text-base">
                            총 상품금액(수량) :
                        </span>
                        <span className="font-amstel mb-1 text-lg md:mb-2 md:text-xl lg:text-2xl xl:text-[2em]">
                            {result}
                        </span>
                        <span className="ms-1 font-pretendard text-xs font-[300] md:ms-2 md:text-sm lg:text-base">
                            {`(${count}개)`}
                        </span>
                    </div>
                ) : (
                    <div className="h-4 md:h-6">{/* 빈칸 추가 */}</div>
                )}

                <div className="font-amstel flex w-full justify-between gap-4 px-2 md:w-5/6 md:gap-6 md:px-0 lg:gap-8 xl:gap-10">
                    <button
                        className="w-1/2 bg-gray-200 py-2 text-center text-sm text-black transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base md:py-3 md:text-lg lg:text-lg"
                        disabled={selectedItems.length === 0}
                        onClick={() => {
                            if (authCheck()) {
                                handleBuy(selectedItems);
                            }
                        }}
                    >
                        buy now
                    </button>
                    <button
                        className="w-1/2 bg-gray-200 py-2 text-center text-sm text-black transition-colors hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base md:py-3 md:text-lg lg:text-lg"
                        disabled={selectedItems.length === 0}
                        onClick={() => handleAddToCart()}
                    >
                        cart
                    </button>
                </div>

                {/* 개선된 하단 탭 섹션 - 아래로만 확장 */}
                <div className="mt-8 flex w-full flex-col gap-4 text-center text-[1rem] font-[500] md:mt-10 md:text-[1.3rem]">
                    <div>
                        <button
                            className={`font-amstel transition-colors duration-200 ${
                                activeTab === "details"
                                    ? "text-black"
                                    : "text-gray-300 hover:text-black"
                            }`}
                            onClick={() => toggleTab("details")}
                        >
                            DETAILS
                        </button>
                        <div
                            className={`overflow-hidden whitespace-pre-line transition-all duration-300 ease-in-out ${
                                activeTab === "details"
                                    ? "max-h-96 opacity-100"
                                    : "max-h-0 opacity-0"
                            }`}
                        >
                            {detailsContent}
                        </div>
                    </div>
                    <div>
                        <button
                            className={`font-amstel transition-colors duration-200 ${
                                activeTab === "delivery"
                                    ? "text-black"
                                    : "text-gray-300 hover:text-black"
                            }`}
                            onClick={() => toggleTab("delivery")}
                        >
                            DELIVERY
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                activeTab === "delivery"
                                    ? "max-h-96 opacity-100"
                                    : "max-h-0 opacity-0"
                            }`}
                        >
                            {deliveryContent}
                        </div>
                    </div>
                    <div>
                        <button
                            className={`font-amstel transition-colors duration-200 ${
                                activeTab === "shipping"
                                    ? "text-black"
                                    : "text-gray-300 hover:text-black"
                            }`}
                            onClick={() => toggleTab("shipping")}
                        >
                            SHIPPING RETURNS
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                activeTab === "shipping"
                                    ? "max-h-[600px] opacity-100"
                                    : "max-h-0 opacity-0"
                            }`}
                        >
                            {shippingContent}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductInfo;
