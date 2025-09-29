import { CouponResponse, ICoupon } from "@/src/entities/type/common";

const getMyCoupon = async (): Promise<CouponResponse> => {
    const res = await fetch(`/api/user/coupon`);
    if (!res.ok) throw new Error("사용자 쿠폰 불러오기 실패");
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

    if (!res.ok) throw new Error("일반 사용자 쿠폰 생성 실패");
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


    if (!res.ok) throw new Error("스페셜 쿠폰 생성 실패 오류");
    return res.json();
};

const postCouponCodeUserCoupon = async (data: Partial<{ couponCode: string }>): Promise<any> => {
    const res = await fetch("/api/user/coupon/code-apply", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("쿠폰 코드 등록 실패 오류");
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
    if (!res.ok) throw new Error("사용자 쿠폰 리스트 불러오기 실패");
    return await res.json();
};

const getManageCouponList = async (): Promise<{
    data: ICoupon[];
    count: number;
}> => {
    const res = await fetch(`/api/admin/list/coupon/manage`);
    if (!res.ok) throw new Error("어드민 쿠폰 리스트 불러오기 실패");
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

    if (!res.ok) throw new Error("쿠폰 템플릿 생성 실패");
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
    if (!res.ok) throw new Error("쿠폰 상태 업데이트 실패");
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
    postCouponCodeUserCoupon,
    patchCoupon,
    deleteCoupon,
    deleteUserCoupon,
};
