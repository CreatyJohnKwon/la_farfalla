"use client";

import {
    priceResult,
    priceDiscount,
    justDiscount,
} from "@src/features/calculate";
import { Product } from "@src/entities/type/interfaces";
import ProductDrop from "@src/widgets/drop/ProductDrop";
import QuantityModal from "@src/widgets/modal/QuantityModal";
import { useEffect, useState } from "react";
import useCart from "@src/shared/hooks/useCart";
import useUser from "@src/shared/hooks/useUsers";
import { redirect } from "next/navigation";

const ProductInfo = ({ product }: { product: Product }) => {
    const {
        count,
        setCount,
        result,
        setResult,
        selectedSize,
        setSelectedSize,
        selectedColor,
        setSelectedColor,
        selectedItems,
        setSelectedItems,
        handleBuy,
        handleSelect,
        handleAddToCart,
    } = useCart();
    const [activeTab, setActiveTab] = useState(null);

    const { session } = useUser();

    useEffect(() => {
        if (selectedSize && selectedColor) {
            handleSelect(selectedSize, selectedColor, product);
        }
    }, [selectedSize, selectedColor]);

    useEffect(() => {
        const temp = selectedItems.reduce(
            (sum, item) => sum + item.quantity,
            0,
        );
        const tempCalc = justDiscount(product) * temp;

        setCount(temp);
        setResult(tempCalc.toLocaleString());
    }, [selectedItems]);

    const toggleTab = (tabName: any) => {
        setActiveTab(activeTab === tabName ? null : tabName);
    };

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
            <div className="mt-3 flex h-full flex-col items-center justify-center gap-3 md:mt-0 md:gap-3 lg:gap-3 xl:gap-4">
                {/* title */}
                <div className="flex flex-col items-center gap-2 text-center md:gap-3 lg:gap-4 xl:gap-5">
                    <span className="font-amstel w-[90vw] text-3xl md:text-4xl xl:text-5xl">
                        {product.title.eg}
                    </span>
                    <span className="-mt-1 font-pretendard text-lg font-[300] md:text-xl xl:text-2xl">
                        {product.title.kr}
                    </span>
                </div>

                {/* Description text */}
                <span className="w-full px-2 text-center font-pretendard text-sm font-[200] xl:text-base">
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

                {/* size drop */}
                <div className="flex w-full flex-col gap-2 px-2 md:w-4/5 md:gap-3 md:px-0 lg:w-3/4">
                    <ProductDrop
                        title={"size"}
                        items={product.size}
                        selected={selectedSize}
                        setSelected={setSelectedSize}
                    />
                    <ProductDrop
                        title={"color"}
                        items={product.colors}
                        selected={selectedColor}
                        setSelected={setSelectedColor}
                    />
                </div>

                {/* 상품 추가 */}
                {selectedItems.map((item) => (
                    <QuantityModal
                        id={item.cartItemId}
                        custom="w-full text-sm md:text-base font-amstel flex items-center justify-end gap-2 md:gap-4 text-black c_md:gap-6 px-2 md:px-0"
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
                        className="w-1/2 bg-gray-200 py-2 text-center text-sm text-black transition-colors hover:bg-gray-300 sm:text-base md:py-3 md:text-lg lg:text-lg"
                        disabled={selectedItems.length === 0}
                        onClick={() => {
                            if (!session) {
                                alert("로그인이 필요합니다.");
                                return redirect("/login");
                            }
                            handleBuy(selectedItems);
                        }}
                    >
                        buy now
                    </button>
                    <button
                        className="w-1/2 bg-gray-200 py-2 text-center text-sm text-black transition-colors hover:bg-gray-300 sm:text-base md:py-3 md:text-lg lg:text-lg"
                        disabled={selectedItems.length === 0}
                        onClick={() => handleAddToCart()}
                    >
                        cart
                    </button>
                </div>

                <div className="mt-10 flex h-[10vh] flex-col gap-4 text-center text-[1rem] font-[500] md:text-[1.3rem]">
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
                        {activeTab === "details" && detailsContent}
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
                        {activeTab === "delivery" && deliveryContent}
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
                        {activeTab === "shipping" && shippingContent}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductInfo;
