"use client";

import OrderDetailModal from "@/src/widgets/modal/OrderDetailModal";
import { OrderData } from "@src/entities/type/interfaces";
import { format } from "date-fns";
import { useState } from "react";

const OrderItem = ({ item }: { item: OrderData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <li
                className="cursor-pointer rounded-md border border-gray-200 p-4 transition hover:border-gray-400"
                onClick={() => setIsModalOpen(true)}
            >
                <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-pretendard text-sm text-gray-800">
                        {`주문번호: ${item.createdAt ? item._id : "error"}`}
                    </h3>
                    <span className="font-amstel text-base text-gray-400">
                        {item.totalPrice.toLocaleString()} KRW
                    </span>
                </div>

                <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-pretendard text-sm font-[200] text-gray-800">
                        {`주문일자: ${
                            item.createdAt
                                ? format(
                                      new Date(item.createdAt),
                                      "yyyy.MM.dd HH:mm",
                                  )
                                : "error"
                        }`}
                    </h3>
                </div>

                <p className="mb-2 font-pretendard text-sm font-[200] text-gray-700">
                    배송지: {item.address} {item.detailAddress} ({item.postcode}
                    )
                </p>

                <div className="mt-2 space-y-1 font-pretendard text-sm font-[200] text-gray-600">
                    {item.items.map((product, i) => (
                        <div key={i}>
                            {`${product.productNm} - ${product.color} /
                        ${product.size} / 수량 ${product.quantity}`}
                        </div>
                    ))}
                </div>
            </li>
            {isModalOpen && (
                <OrderDetailModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    order={item}
                />
            )}
        </>
    );
};

export default OrderItem;
