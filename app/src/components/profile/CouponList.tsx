"use client";

import { Coupon } from "@/src/entities/type/interfaces";
import { useUserQuery } from "@/src/shared/hooks/react-query/useUserQuery";
import { getCoupon } from "@/src/shared/lib/server/user";
import { useState, useEffect } from "react";

const CouponList = () => {
    const [coupons, setCoupons] = useState([]);
    const { data: user, isLoading } = useUserQuery();

    useEffect(() => {
        if (!user?._id) return;

        getCoupon(user?._id).then(setCoupons).catch(console.error);
    }, [user]);

    return (
        <ul className="flex w-[90vw] flex-col gap-4 sm:w-auto">
            {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <li
                        key={`coupon_skeleton_${i}`}
                        className="animate-pulse border border-gray-200 bg-slate-100 p-4"
                    >
                        <div className="mb-3 h-7 w-1/3 bg-gray-300" />
                        <div className="h-5 w-1/4 bg-gray-300" />
                    </li>
                ))
            ) : coupons.length > 0 ? (
                coupons.map((coupon: Coupon) => (
                    <li
                        key={coupon._id}
                        className="border border-gray-200 bg-white p-4"
                    >
                        <div className="flex flex-row items-start justify-between">
                            <span className="font-pretendard-thin text-[0.3em] sm:text-[0.5em] md:text-[0.8em]">
                                {coupon.name}
                            </span>
                            <div className="text-[0.2em] text-red-500 md:text-[0.3em]">
                                {`만료일: ${new Date(coupon.expiredAt).toLocaleDateString()}`}
                            </div>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                            {coupon.description || "설명 없음"}
                        </div>
                    </li>
                ))
            ) : (
                <li className="font-pretendard-thin mt-20 w-full text-center text-[0.5em] text-black/60">
                    사용 가능한 쿠폰이 없습니다
                </li>
            )}
        </ul>
    );
};

export default CouponList;
