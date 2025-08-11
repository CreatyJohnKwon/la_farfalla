import { ProductOption } from "@/src/components/product/interface";
import axios from "axios";

const updateCoupon = async (couponId: string) => {
    try {
        const payload: any = {};
        const res = await axios.patch(`/api/user/coupon/${couponId}`, payload);

        if (!res.data) throw new Error("업데이트 실패");

        return res.data;
    } catch (error: any) {
        console.error("🔥 Axios PATCH 실패:", error.message);
        if (error.response) {
            console.error("📥 error.response.data:", error.response.data);
            console.error("📊 error.response.status:", error.response.status);
        }
        throw error;
    }
};

const updateAdminOrder = async (
    orderId: string | undefined,
    shippingStatus: string,
    trackingNumber: string | undefined,
) => {
    const res = await fetch("/api/admin/list/order", {
        method: "POST",
        body: JSON.stringify({ orderId, shippingStatus, trackingNumber }),
        headers: { "Content-Type": "application/json" },
    });

    const result = await res.json();
    return result;
};

const getOrder = async (userId: string) => {
    const res = await fetch(`/api/user/order?userId=${userId}`);
    if (!res.ok) throw new Error("마일리지 불러오기 실패");
    return await res.json();
};

const getOrderList = async () => {
    const res = await fetch(`/api/admin/list/order`);
    if (!res.ok) throw new Error("주문 리스트 불러오기 실패");
    return await res.json();
};

const sendMail = async (body: any) =>
    await fetch("/api/order/notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
    });

const updateStock = async (
    items: ProductOption[],
    action: "reduce" | "restore",
    productId?: string,
) => {
    try {
        const response = await fetch("/api/order/stock-update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                items,
                action, // "reduce" 또는 "restore"
                productId,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to update stock");
        }

        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error(
            `❌ 재고 ${action === "reduce" ? "차감" : "복구"} 실패:`,
            error.message,
        );
        throw new Error(
            `재고 ${action === "reduce" ? "차감" : "복구"} 실패: ${error.message}`,
        );
    }
};

const updateOrderAddress = async (
    orderId: string,
    newAddress: {
        postcode: string;
        address: string;
        detailAddress: string;
        deliveryMemo: string;
    },
    reason?: string,
    orderInfo?: string,
) => {
    const response = await fetch(`/api/order/${orderId}/address`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            newAddress,
            reason,
            orderInfo,
        }),
    });

    if (!response.ok) {
        throw new Error("배송지 변경에 실패했습니다.");
    }

    return response.json();
};

export {
    updateCoupon,
    getOrder,
    getOrderList,
    updateAdminOrder,
    sendMail,
    updateStock,
    updateOrderAddress,
};
