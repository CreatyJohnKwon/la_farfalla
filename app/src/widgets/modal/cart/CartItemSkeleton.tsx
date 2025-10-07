import React from "react";

interface CartItemSkeletonProps {
    /** 렌더링할 스켈레톤 아이템의 개수 (기본값: 3) */
    count?: number;
}

const CartItemSkeleton = ({ count = 3 }: CartItemSkeletonProps) => {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <li
                    key={`skeleton-${index}`}
                    className="flex w-full flex-col items-center justify-center sm:hidden"
                >
                    <div className="relative flex w-full animate-pulse items-center gap-4 border-b p-4 sm:p-5">
                        {/* 이미지 스켈레톤 */}
                        <div className="h-20 w-20 flex-shrink-0 rounded bg-gray-200 sm:h-24 sm:w-24"></div>

                        <div className="flex flex-grow flex-col space-y-3">
                            {/* 상품명 스켈레톤 */}
                            <div className="h-4 w-4/5 rounded bg-gray-200"></div>
                            {/* 옵션 스켈레톤 */}
                            <div className="h-3 w-3/5 rounded bg-gray-200"></div>
                            {/* 수량 조절 버튼 스켈레톤 */}
                            <div className="h-6 w-24 rounded bg-gray-200"></div>
                        </div>

                        {/* 가격 스켈레톤 */}
                        <div className="mb-2 h-5 w-1/5 self-end rounded bg-gray-200"></div>
                    </div>
                </li>
            ))}
        </>
    );
};

export default CartItemSkeleton;