"use client"

import { useState } from "react";
import ModalWrap from "../etc/ModalWrap";
import { useGetUserCouponsListQuery, usePostByCouponCodeMutation } from "@src/shared/hooks/react-query/useBenefitQuery";

const ApplyCouponCodeModal = ({ onClose }: { onClose: () => void }) => {
    const [couponCode, setCouponCode] = useState<string>("")
    const postByCouponCodeMutation = usePostByCouponCodeMutation();
    const { refetch: userCouponRefetch } = useGetUserCouponsListQuery(true);

    const handleCouponApply = () => {
        if (couponCode.length === 0) return;

        try {
            postByCouponCodeMutation.mutate(
                { couponCode: couponCode },
                {
                    onSuccess: () => { // onError 는 mutation 에서 반응
                        alert("쿠폰이 정상적으로 등록되었습니다.");
                        userCouponRefetch();
                        onClose();
                    }
                },
            );
        } catch (error) {
            console.error('쿠폰 배포 실패:', error);
            alert('쿠폰 등록에 실패했습니다.\n다시 시도하거나 문의 바랍니다.');
        }
    };

    const handleClose = () => {
        if (couponCode.length > 0) {
            confirm("쿠폰 등록을 취소하시겠습니까?") && onClose()
        } else onClose()
    }

    return (
        <ModalWrap
            className="w-full max-w-md p-5 bg-white rounded-sm"
            onClose={() => handleClose()}
        >
            <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* 제목 및 닫기 버튼 */}
                <div className="flex items-center justify-between pb-5 border-b border-gray-200">
                    <span className="text-xl font-pretendard-bold text-gray-900">
                        쿠폰 등록
                    </span>
                    <button
                        onClick={() => handleClose()}
                        className="text-2xl text-gray-400 transition-colors font-amstel font-[600] hover:text-gray-600 focus:outline-none"
                    >
                        &times;
                    </button>
                </div>
                
                <div className="flex flex-col">
                    {/* 쿠폰 번호 입력 영역 */}
                    <div className="flex flex-col items-center justify-center pt-6">
                        <label htmlFor="coupon-code" className="text-gray-600 mb-2 font-pretendard text-base">
                            쿠폰 번호를 입력하세요
                        </label>
                        <input
                            id="coupon-code"
                            type="text"
                            maxLength={40}
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="w-full px-4 py-3 text-center border-2 text-base uppercase font-pretendard rounded-xs transition-all duration-300 placeholder:text-gray-400 outline-none"
                            placeholder="COUPONCODE12"
                            required
                        />
                    </div>

                    {/* 버튼 영역 */}
                    <div className="pt-8">
                        <button
                            onClick={() => confirm("쿠폰을 등록하시겠습니까?") && handleCouponApply()}
                            type="submit"
                            className={`w-full px-4 py-3 text-base font-pretendard font-[600] text-white rounded-xs transition-colors focus:outline-none hover:bg-gray-500 ${couponCode.length === 0 ? "bg-gray-500": "bg-gray-900"}`}
                            disabled={couponCode.length === 0}
                        >
                            등록하기
                        </button>
                    </div>
                </div>
            </div>
        </ModalWrap>
    );
};

export default ApplyCouponCodeModal;