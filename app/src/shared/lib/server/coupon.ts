import { CouponResponse, ICoupon } from "@/src/entities/type/interfaces";

const getMyCoupon = async (): Promise<CouponResponse> => {
    const res = await fetch(`/api/user/coupon`);
    if (!res.ok) throw new Error("쿠폰 불러오기 실패");
    return await res.json();
};

const postUserCoupon = async (data: Partial<any>): Promise<any> => {
    const res = await fetch("/api/user/coupon", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("쿠폰 생성 실패");
    }

    return res.json();
};

const postSpecialUserCoupon = async (data: Partial<any>): Promise<any> => {
    const res = await fetch("/api/user/coupon/distribute", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.message || "알 수 없는 쿠폰 생성 실패 오류";
        
        return res.json();
    }


    return res.json();
};

const deleteUserCoupon = async (_id: string | undefined) => {
    if (!_id) throw new Error("Coupon id is undefined");

    const res = await fetch("/api/user/coupon", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id }),
    });
    if (!res.ok) throw new Error("쿠폰 삭제 실패");
    return res.json();
};

const getCouponList = async (): Promise<CouponResponse> => {
    const res = await fetch(`/api/admin/list/coupon`);
    if (!res.ok) throw new Error("쿠폰 불러오기 실패");
    return await res.json();
};

const getManageCouponList = async (): Promise<{
    data: ICoupon[];
    count: number;
}> => {
    const res = await fetch(`/api/admin/list/coupon/manage`);
    if (!res.ok) throw new Error("쿠폰 불러오기 실패");
    return await res.json();
};

const postCoupon = async (data: Partial<ICoupon>): Promise<ICoupon> => {
    const res = await fetch("/api/admin/list/coupon/manage", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        throw new Error("쿠폰 생성 실패");
    }

    return res.json();
};

// 현재는 토글 용도로만 사용됨
const patchCoupon = async ({
    couponId,
    currentIsActive,
}: {
    couponId: string;
    currentIsActive: boolean;
}) => {
    const res = await fetch("/api/admin/list/coupon/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            _id: couponId,
            isActive: !currentIsActive,
        }),
    });
    if (!res.ok) throw new Error("쿠폰 수정 실패");
    return res.json();
};

const deleteCoupon = async (_id: string | undefined) => {
    if (!_id) throw new Error("Coupon id is undefined");

    const res = await fetch("/api/admin/list/coupon/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id }),
    });
    if (!res.ok) throw new Error("쿠폰 삭제 실패");
    return res.json();
};

export {
    getMyCoupon,
    getCouponList,
    getManageCouponList,
    postCoupon,
    postUserCoupon,
    postSpecialUserCoupon,
    patchCoupon,
    deleteCoupon,
    deleteUserCoupon,
};
