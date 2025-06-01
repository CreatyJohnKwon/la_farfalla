"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import useOrder from "@/src/shared/hooks/useOrder";

const Order = () => {
    const [deliveryMemo, setDeliveryMemo] = useState("");
    const [customMemo, setCustomMemo] = useState("");
    const { orderDatas } = useOrder();

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (!orderDatas) return;
            e.preventDefault();
            e.returnValue = ""; // 표준을 따르는 대부분의 브라우저에서 필수
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [orderDatas]);

    if (orderDatas)
        return (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    // 여기에 결제 처리 로직
                    console.log("폼 제출됨!");
                }}
                className="h-screen w-full bg-gray-50 pt-20 md:pt-32"
            >
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 p-5 md:grid-cols-2">
                    {/* 좌측 영역 */}
                    <div className="space-y-6">
                        {/* 주문 상품 정보 */}
                        <section className="border bg-white p-4">
                            <h2 className="font-pretendard-bold mb-4">
                                주문 상품 정보
                            </h2>
                            <div className="flex gap-4">
                                <Image
                                    width={200}
                                    height={200}
                                    src="/coat.jpg"
                                    alt="상품 이미지"
                                    className="h-32 w-24 object-cover"
                                />
                                <div>
                                    <p className="font-amstel">
                                        {`Paper Vintage Coat - mint beige`}
                                    </p>
                                    <p className="font-pretendard text-sm text-gray-600">
                                        {`1개`}
                                    </p>
                                    <p className="font-amstel-bold mt-2">
                                        {`KRW 219,000`}
                                    </p>
                                    <p className="font-pretendard text-sm text-gray-400">
                                        배송비 무료
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 주문자 정보 */}
                        <section className="border bg-white p-4">
                            <h2 className="font-pretendard-bold mb-4">
                                주문자 정보
                            </h2>
                            <p className="mb-2 font-pretendard text-sm text-gray-600">
                                주문취소는 입금대기, 또는 결제완료 상태에서만
                                가능하며 이미 개봉한 상품은 반품이 불가합니다.
                            </p>
                            <div className="text-sm">
                                <p className="font-pretendard">{`채린`}</p>
                                <p className="font-amstel mt-1">
                                    010-9999-8695
                                </p>
                                <p className="font-amstel">
                                    cofl50411@naver.com
                                </p>
                            </div>
                        </section>

                        {/* 배송 정보 */}
                        <section className="border bg-white p-4">
                            <h2 className="font-pretendard-bold mb-4">
                                배송 정보
                            </h2>
                            <div className="text-sm">
                                <p className="font-pretendard">{`채린`}</p>
                                <p className="font-amstel mt-1">
                                    010-9999-8695
                                </p>
                                <p className="font-pretendard">{`의정부시 신흥로 23번길 11 리온트리1308호 (11651)`}</p>
                            </div>

                            <select
                                name="deliveryMemo"
                                value={deliveryMemo}
                                onChange={(e) =>
                                    setDeliveryMemo(e.target.value)
                                }
                                className="mt-4 w-full appearance-none rounded border border-gray-300 bg-white p-3 pr-8 text-sm text-gray-800"
                            >
                                <option value="">
                                    배송메모를 선택해 주세요.
                                </option>
                                <option value="문 앞에 두고 가세요.">
                                    문 앞에 두고 가세요.
                                </option>
                                <option value="경비실에 맡겨주세요.">
                                    경비실에 맡겨주세요.
                                </option>
                                <option value="custom">직접 입력.</option>
                            </select>

                            {deliveryMemo === "custom" && (
                                <input
                                    type="text"
                                    name="customDeliveryMemo"
                                    value={customMemo}
                                    onChange={(e) =>
                                        setCustomMemo(e.target.value)
                                    }
                                    placeholder="배송메모를 입력해 주세요."
                                    className="mt-2 w-full border p-2 text-sm"
                                />
                            )}
                        </section>

                        {/* 쿠폰 및 적립금 */}
                        <section className="border bg-white p-4">
                            <h2 className="font-pretendard-bold mb-2">쿠폰</h2>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    name="coupon"
                                    placeholder="쿠폰 코드를 입력해 주세요"
                                    className="w-full border p-2 text-sm"
                                />
                                <button
                                    type="button"
                                    className="bg-black px-10 py-2 font-pretendard text-sm text-white"
                                >
                                    적용
                                </button>
                            </div>
                        </section>

                        <section className="border bg-white p-4">
                            <h2 className="font-pretendard-bold mb-2">
                                적립금
                            </h2>
                            <div className="flex items-center justify-between">
                                <p className="text-sm">
                                    사용 가능 적립금{" "}
                                    <span className="font-medium">7,095</span>
                                </p>
                                <label className="flex items-center gap-1 text-sm">
                                    <input type="checkbox" name="usePoint" />
                                    전액사용
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* 우측 영역 */}
                    <div className="space-y-6">
                        {/* 주문 요약 */}
                        <section className="border bg-white p-4">
                            <h2 className="font-pretendard-bold mb-4">
                                주문 요약
                            </h2>
                            <div className="mb-2 flex justify-between text-sm">
                                <span className="font-pretendard">
                                    상품가격
                                </span>
                                <span className="font-amstel">KRW 219,000</span>
                            </div>
                            <div className="mb-2 flex justify-between text-sm">
                                <span className="font-pretendard">배송비</span>
                                <span className="font-pretendard">무료</span>
                            </div>
                            <div className="mt-4 flex justify-between text-lg font-bold">
                                <span className="font-pretendard-bold">
                                    총 주문금액
                                </span>
                                <span className="font-amstel-bold">
                                    KRW 219,000
                                </span>
                            </div>
                            <p className="mt-2 font-pretendard text-sm text-gray-500">
                                <span className="font-amstel">
                                    2,190 Mileage
                                </span>
                                <span> 적립 예정</span>
                            </p>
                        </section>

                        {/* 결제수단 */}
                        <section className="border bg-white p-4">
                            <h2 className="font-pretendard-bold mb-4">
                                결제수단
                            </h2>
                            <div className="flex gap-4 font-pretendard">
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="card"
                                    />{" "}
                                    신용카드
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="bank"
                                    />{" "}
                                    무통장입금
                                </label>
                            </div>
                        </section>

                        {/* 약관 동의 */}
                        <section className="border bg-white p-4 font-pretendard">
                            <label className="flex items-start gap-2 text-sm leading-tight">
                                <input type="checkbox" name="agree" required />
                                <span className="-mt-0.5">
                                    전체 동의 (구매조건 확인 및 결제진행에 동의)
                                </span>
                            </label>
                        </section>

                        {/* 결제 버튼 */}
                        <button
                            type="submit"
                            className="font-pretendard-bold w-full bg-black py-3 text-white"
                        >
                            결제하기
                        </button>
                    </div>
                </div>
            </form>
        );
};

export default Order;
