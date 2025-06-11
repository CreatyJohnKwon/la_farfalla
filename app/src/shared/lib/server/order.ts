import Order from "@/src/entities/models/Order";
import axios from "axios";
import mongoose from "mongoose";

const updateCoupon = async (couponId: string) => {
    try {
        const res = await axios.patch(`/api/user/coupon/${couponId}`);

        console.log("✅ response data:", res.data);
        console.log("📡 status:", res.status);
        console.log("📄 full response:", res);

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
    trackingNumber: string,
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

const getAllOrder = async () => {
    const res = await fetch(`/api/admin/list/order`);
    if (!res.ok) throw new Error("주문 리스트 불러오기 실패");
    return await res.json();
};

export { updateCoupon, getOrder, getAllOrder, updateAdminOrder };
