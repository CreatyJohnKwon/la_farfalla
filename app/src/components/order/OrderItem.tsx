"use client";

import OrderDetailModal from "@/src/widgets/modal/order/OrderDetailModal";
import { format } from "date-fns";
import { useState } from "react";
import { specialReviewItem } from "../../entities/type/products";
import SpecialReviewModal from "@/src/widgets/modal/review/SpecialReviewModal";
import { OrderData, OrderItem as OrderItemInterface } from "./interface";

const OrderItem = ({ item }: { item: OrderData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [productItem, setProductItem] = useState<specialReviewItem>({
        orderId: "",
        productId: "",
        productImage: [],
        productName: ""
    });

    const handleWriteReviewClick = (e: any, item: OrderData) => {
        e.stopPropagation();

        if (!item || !item.items || item.items.length === 0) {
            return;
        }

        const uniqueProductIds = new Set(item.items.map((p: OrderItemInterface) => p.productId));

        if (uniqueProductIds.size > 1) {
            alert("리뷰를 작성할 상품을 선택해주세요.");
        } else {
            const product = item.items[0];
            setProductItem({
                orderId: item._id,
                productId: product.productId,
                productName: product.productNm,
                productImage: product.image,
            });
            setIsReviewModalOpen(true);
        }
    };

    const totalQuantity = (): string => 
        item.items.reduce((a, c) => {
            return a + c.quantity;
        }, 0).toString()  || ""

    return (
        <>
            <li
                className="group z-40 cursor-pointer border border-gray-100 bg-white p-5 transition-all duration-200 active:bg-gray-50 sm:border-gray-200 sm:p-6 sm:hover:border-gray-300"
                onClick={() => setIsModalOpen(true)}
                style={{ touchAction: "manipulation" }}
            >
                {/* 헤더: 주문번호와 금액 */}
                <div className="mb-4 flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                        <p className="font-pretendard text-xs font-[500] text-gray-900 sm:text-sm">
                            주문 번호 |{" "}
                            <span className="font-mono">
                                {item.createdAt ? `${item._id}` : "ERROR"}
                            </span>
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            {item.createdAt
                                ? format(
                                      new Date(item.createdAt),
                                      "MM.dd HH:mm",
                                  )
                                : "error"}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-900 sm:text-base font-amstel-bold">
                            {item.totalPrice.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 font-amstel">KRW</p>
                    </div>
                </div>

                {/* 상품 정보 */}
                <div className="mb-4">
                    <p className="mb-2 text-xs text-gray-700 sm:text-sm font-pretendard">
                        주문상품 {totalQuantity()}개
                    </p>
                    <div className="space-y-2 font-pretendard">
                        {item.items.slice(0, 2).map((product, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs text-gray-900 sm:text-sm">
                                        {product.productNm}
                                    </p>
                                    <p className="text-xs text-gray-500 font-pretendard font-[300]">
                                        {product.additional ? `${product.additional}` : `${product.color} · ${product.size}`}
                                    </p>
                                </div>
                                <p className="ml-3 text-xs text-gray-500">
                                    {product.quantity}개
                                </p>
                            </div>
                        ))}
                        {item.items.length > 2 && (
                            <p className="text-xs text-gray-400">
                                외 {item.items.length - 2}개 상품
                            </p>
                        )}
                    </div>
                </div>

                {/* 상태 표시 */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center">
                        <div
                            className={`mr-2 h-2 w-2 rounded-full ${
                                item.shippingStatus === "pending"
                                    ? "bg-yellow-400"
                                    : item.shippingStatus === "ready"
                                      ? "bg-blue-400"
                                      : item.shippingStatus === "shipped"
                                        ? "bg-green-400"
                                        : item.shippingStatus === "cancel" ||
                                            item.shippingStatus === "return" ||
                                            item.shippingStatus === "exchange"
                                                ? "bg-red-400"
                                                : "bg-gray-400"
                            }`}
                        />
                        <p className="text-xs text-gray-600 font-pretendard font-[400]">
                            {item.shippingStatus === "pending"
                                ? "주문완료"
                                : item.shippingStatus === "ready"
                                  ? "상품준비중"
                                  : item.shippingStatus === "shipped"
                                    ? "출고"
                                        : item.shippingStatus === "cancel" ||
                                            item.shippingStatus === "return" ||
                                            item.shippingStatus === "exchange"
                                                ? "주문취소"
                                                : "구매확정"}
                        </p>
                    </div>

                    <div className="flex items-center text-gray-400 group-active:text-gray-600 sm:group-hover:text-gray-600">
                        {/* 더보기 인디케이터 */}
                        {item.shippingStatus === "confirm" ? (
                            <span 
                                className="text-red-500 text-xs underline" 
                                onClick={(e) => handleWriteReviewClick(e, item)}
                            >
                                리뷰 쓰기
                            </span>
                        ) : (
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 5l7 7-7 7"
                                />
                            </svg>
                        )}
                    </div>
                </div>
            </li>

            {isModalOpen && (
                <OrderDetailModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    order={item}
                />
            )}

            {isReviewModalOpen && (
                <SpecialReviewModal
                    onClose={() => setIsReviewModalOpen(false)}
                    productItem={productItem}
                />
            )}
        </>
    );
};

export default OrderItem;
