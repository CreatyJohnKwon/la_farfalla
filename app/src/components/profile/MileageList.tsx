"use client";

import { useState, useEffect } from "react";
import { getMileage } from "@/src/shared/lib/server/user";
import { useUserQuery } from "@/src/shared/hooks/react-query/useUserQuery";
import { Mileage } from "@/src/entities/type/interfaces";

const MileageList = () => {
    const [mileage, setMileage] = useState<Mileage[] | []>([]);
    const { data: user, isLoading } = useUserQuery();

    useEffect(() => {
        if (!user?._id) return;

        getMileage(user?._id).then(setMileage).catch(console.error);
    }, [user]);

    return (
        <ul className="flex w-[90vw] flex-col gap-4 sm:w-auto">
            {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <li
                        key={`mileage_skeleton_${i}`}
                        className="animate-pulse border border-gray-200 bg-slate-100 p-4"
                    >
                        <div className="mb-2 h-4 w-1/3 bg-gray-300" />
                        <div className="mb-2 h-3 w-1/3 bg-gray-300" />
                        <div className="mb-2 h-3 w-1/3 bg-gray-300" />
                        <div className="mb-2 h-3 w-1/3 bg-gray-300" />
                    </li>
                ))
            ) : mileage.length > 0 ? (
                mileage.map((item: Mileage) => (
                    <li
                        key={item._id}
                        className={`border p-4 ${
                            item.type === "earn"
                                ? "border-gray-200 bg-transparent"
                                : "border-red-200 bg-red-50"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">
                                {item.type === "earn" ? "적립" : "사용"}
                            </span>
                            <span
                                className={`font-amstel text-base ${
                                    item.type === "earn"
                                        ? "text-green-600"
                                        : "text-red-600"
                                }`}
                            >
                                {item.type === "earn" ? "+" : "-"}
                                {item.amount.toLocaleString()}P
                            </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                            {item.description || "내용 없음"}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()} 발생
                        </div>
                        {item.expiredAt && (
                            <div className="mt-1 text-xs text-gray-400">
                                만료일:{" "}
                                {new Date(item.expiredAt).toLocaleDateString()}
                            </div>
                        )}
                    </li>
                ))
            ) : (
                <li className="font-pretendard-thin mt-20 w-full text-center text-[0.5em] text-black/60">
                    마일리지 내역이 없습니다
                </li>
            )}
        </ul>
    );
};

export default MileageList;
