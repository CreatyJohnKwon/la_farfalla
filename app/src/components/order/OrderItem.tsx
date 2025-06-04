"use client";

import { OrderData } from "@src/entities/type/interfaces";
import { format } from "date-fns";

const OrderItem = ({ item }: { item: OrderData }) => {
    return (
        <li className="border border-gray-200 p-4 transition hover:border-gray-400">
            <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">
                    {`주문번호: ${item.createdAt ? item._id : "error"}`}
                </h3>
                <span className="text-sm font-light text-gray-500">
                    총금액: {item.totalPrice.toLocaleString()}원
                </span>
            </div>

            <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm text-gray-800">
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

            <p className="mb-2 text-sm text-gray-700">
                배송지: {item.address} {item.detailAddress} ({item.postcode})
            </p>

            <div className="mt-2 space-y-1 text-sm text-gray-600">
                {item.items.map((product, i) => (
                    <div key={i}>
                        {`${product.productNm} - ${product.color} /
                        ${product.size} / 수량 ${product.quantity}`}
                    </div>
                ))}
            </div>
        </li>
    );
};

export default OrderItem;
