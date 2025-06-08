import axios from "axios";

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

export { updateCoupon };
