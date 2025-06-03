"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import useOrder from "@src/shared/hooks/useOrder";
import { useUserQuery } from "@src/shared/hooks/react-query/useUserQuery";
import { useCouponsQuery } from "@src/shared/hooks/react-query/useBenefitQuery";
import DefaultImage from "../../public/images/chill.png";
import { useAddress } from "@/src/shared/hooks/useAddress";
import AddressModal from "@/src/features/address/AddressModal";
import { redirect } from "next/navigation";

const Order = () => {
    const { data: user, isLoading } = useUserQuery();
    const { data: coupons, isLoading: isCouponsLoading } = useCouponsQuery(
        user?._id,
    );

    const [deliveryMemo, setDeliveryMemo] = useState("");
    const [customMemo, setCustomMemo] = useState("");
    const [couponMemo, setCouponMemo] = useState("");
    const [useCoupon, setUseCoupon] = useState(0);
    const [applyCoupon, setApplyCoupon] = useState(0);
    const [totalPrice, setTotalPrice] = useState("0");
    const [totalMileage, setTotalMileage] = useState("0");
    const [appliedCouponName, setAppliedCouponName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const { orderDatas } = useOrder();

    const { isOpen, openModal, closeModal, onComplete, formatPhoneNumber } =
        useAddress();

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

    useEffect(() => {
        if (!orderDatas) return;

        const discountedPrice =
            orderDatas.reduce(
                (acc, p) => acc + p.discountPrice * p.quantity,
                0,
            ) *
            (1 - applyCoupon / 100);

        setTotalPrice(Math.floor(discountedPrice).toLocaleString());
        setTotalMileage(Math.floor(discountedPrice * 0.01).toLocaleString());
    }, [applyCoupon, orderDatas]);

    useEffect(() => {
        if (!user) return;

        setPhoneNumber(user.phoneNumber);
        setAddress(user.address);
        setDetailAddress(user.detailAddress);
    }, [user]);

    if (user && !isLoading && orderDatas.length > 0)
        return (
            <form
                onSubmit={(e) => {
                    // 이벤트 전이 방지
                    e.preventDefault();

                    if (
                        phoneNumber === "000-0000-0000" ||
                        phoneNumber.length < 11
                    )
                        return alert("전화번호를 확인해주세요.");

                    if (address === "" || detailAddress === "")
                        return alert("주소를 확인해주세요.");

                    alert("결제가 완료되었습니다.");
                    redirect("/home");
                }}
                className="h-full min-h-screen w-full bg-gray-50 pt-16 md:pt-24"
            >
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 p-5 md:grid-cols-2">
                    {/* 좌측 영역 */}
                    <div className="space-y-6 md:h-[85vh] md:overflow-auto">
                        {/* 주문 상품 정보 */}
                        <section className="border bg-white p-4">
                            <h2 className="font-pretendard-bold mb-4">
                                주문 상품 정보
                            </h2>
                            <div className="max-h-[21vh] overflow-auto">
                                {orderDatas.map((product, index) => (
                                    // 주문 상품 정보
                                    <div
                                        className="flex gap-4 p-2"
                                        key={`order_product_${index}`}
                                    >
                                        <Image
                                            src={
                                                product.image
                                                    ? `https://pub-29feff62c6da44ea8503e0dc13db4217.r2.dev/${product.image}`
                                                    : DefaultImage
                                            }
                                            alt="상품 이미지"
                                            width={500}
                                            height={500}
                                            style={{ objectFit: "contain" }}
                                            className="h-24 w-24"
                                            priority
                                        />
                                        <div>
                                            <p className="font-amstel">
                                                {`${product?.title} - ${product?.color}`}
                                            </p>
                                            <p className="font-pretendard text-sm text-gray-600">
                                                {`${product?.quantity}개`}
                                            </p>
                                            <p className="font-amstel-bold mt-2">
                                                {`KRW ${(product?.discountPrice * product?.quantity).toLocaleString()}`}
                                            </p>
                                            <p className="font-pretendard text-sm text-gray-400">
                                                배송비 무료
                                            </p>
                                        </div>
                                    </div>
                                ))}
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
                                <p className="font-pretendard">{user.name}</p>
                                <input
                                    className="font-amstel mt-1 rounded-none border-b text-black focus:outline-none focus:ring-1 focus:ring-gray-200"
                                    type="tel"
                                    value={
                                        phoneNumber.startsWith("000")
                                            ? ""
                                            : phoneNumber
                                    }
                                    name="phoneNumber"
                                    onChange={(e) => {
                                        const raw = e.target.value
                                            .replace(/\D/g, "")
                                            .slice(0, 11);
                                        const formatted =
                                            formatPhoneNumber(raw);
                                        setPhoneNumber(formatted);
                                    }}
                                    maxLength={
                                        phoneNumber.startsWith("02") ? 12 : 13
                                    }
                                    placeholder={`000-0000-0000`}
                                />

                                <p className="font-amstel">
                                    {user.email || "이메일 정보 없음"}
                                </p>
                            </div>
                        </section>

                        {/* 배송 정보 */}
                        <section className="border bg-white p-4">
                            <h2 className="font-pretendard-bold mb-4">
                                배송 정보
                            </h2>
                            <div className="text-sm">
                                <p className="font-pretendard">{user.name}</p>
                                <p className="font-amstel mt-1">
                                    {phoneNumber.startsWith("000") ||
                                    phoneNumber === ""
                                        ? "000-0000-0000"
                                        : phoneNumber}
                                </p>

                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        name="address"
                                        value={address}
                                        onChange={(e) =>
                                            setAddress(e.target.value)
                                        }
                                        placeholder="주소"
                                        readOnly
                                        className="mt-4 w-full appearance-none border border-gray-200 bg-white p-3 py-3 pr-8 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openModal((value) =>
                                                setAddress(value),
                                            )
                                        }
                                        className="font-pretendard-bold absolute right-1 top-1/3 bg-black px-5 py-2 text-sm text-white hover:bg-gray-800"
                                    >
                                        주소찾기
                                    </button>
                                </div>
                            </div>

                            <input
                                name="detailAddress"
                                value={detailAddress}
                                onChange={(e) =>
                                    setDetailAddress(e.target.value)
                                }
                                className="mt-4 w-full appearance-none border border-gray-300 bg-white p-3 pr-8 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-200"
                                placeholder="상세주소를 입력해주세요."
                            />

                            <select
                                name="deliveryMemo"
                                value={deliveryMemo}
                                onChange={(e) =>
                                    setDeliveryMemo(e.target.value)
                                }
                                className={`mt-4 w-full appearance-none border border-gray-300 bg-white p-3 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-gray-200 ${
                                    deliveryMemo === ""
                                        ? "text-gray-400"
                                        : "text-black"
                                }`}
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
                                    name="deliveryMemo"
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
                            <h2 className="font-pretendard-bold mb-5">쿠폰</h2>
                            <div className="relative flex w-full gap-2">
                                <select
                                    name="coupon"
                                    value={couponMemo}
                                    onChange={(e) => {
                                        const selectedName = e.target.value;
                                        const selectedCoupon = coupons?.find(
                                            (c) => c.name === selectedName,
                                        );
                                        if (selectedCoupon) {
                                            setCouponMemo(e.target.value);
                                            setUseCoupon(
                                                +selectedCoupon.discountValue,
                                            );
                                        }
                                    }}
                                    className="w-full appearance-none border border-gray-300 bg-white p-3 pr-8 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-200"
                                >
                                    <option value="">
                                        적용할 쿠폰을 선택해주세요.
                                    </option>
                                    {!isCouponsLoading &&
                                        coupons?.map((items, index) => (
                                            <option
                                                key={`coupon_${index}`}
                                                value={items.name}
                                            >
                                                {items.name}
                                            </option>
                                        ))}
                                </select>
                                <button
                                    type="button"
                                    className="font-pretendard-bold absolute right-1 top-1/2 -translate-y-1/2 bg-black px-5 py-2 text-sm text-white hover:bg-gray-800"
                                    onClick={() => {
                                        setApplyCoupon(useCoupon);
                                        setAppliedCouponName(couponMemo);
                                        setCouponMemo("");
                                    }}
                                    disabled={couponMemo === ""}
                                >
                                    적용
                                </button>
                            </div>

                            {applyCoupon !== 0 && (
                                <div className="mt-4 flex items-center justify-between border border-dashed border-gray-400 bg-gray-50 px-4 py-3 text-sm">
                                    <div>
                                        <span className="font-pretendard">
                                            {`${appliedCouponName} 쿠폰이 적용되었습니다.\t`}
                                        </span>
                                        <span className="text-gray-500">
                                            ({applyCoupon.toLocaleString()}%
                                            할인)
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCouponMemo("");
                                            setUseCoupon(0);
                                            setApplyCoupon(0);
                                        }}
                                        className="ml-4 text-xl text-gray-400 transition hover:text-red-500"
                                        aria-label="쿠폰 삭제"
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}
                        </section>

                        <section className="border bg-white p-4">
                            {/* name="mileage" */}
                            <h2 className="font-pretendard-bold mb-2">
                                적립금
                            </h2>
                            <div className="flex items-center justify-between">
                                <p className="text-sm">
                                    사용 가능 적립금{" "}
                                    <span className="font-medium">
                                        {user.mileage || 0}
                                    </span>
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
                                <span className="font-amstel">
                                    {`KRW ${totalPrice}`}
                                </span>
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
                                    {`KRW ${totalPrice}`}
                                </span>
                                <input
                                    type="text"
                                    name="totalPrice"
                                    value={totalPrice}
                                    className="hidden"
                                    readOnly
                                />
                            </div>
                            <p className="mt-2 font-pretendard text-sm text-gray-500">
                                <span className="font-amstel">
                                    {`${totalMileage} Mileage`}
                                </span>
                                <span> 적립 예정</span>
                                <input
                                    type="text"
                                    name="totalMileage"
                                    value={totalMileage}
                                    className="hidden"
                                    readOnly
                                />
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
                                        value="social"
                                        defaultChecked
                                    />
                                    {"\t간편결제"}
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="card"
                                    />
                                    {"\t신용카드"}
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="bank"
                                    />
                                    {"\t무통장입금"}
                                </label>
                            </div>
                        </section>

                        {/* 약관 동의 */}
                        <section className="border bg-white p-4 font-pretendard">
                            <label className="flex items-start gap-2 text-sm leading-tight">
                                <input
                                    type="checkbox"
                                    name="paymentAgree"
                                    required
                                />
                                <span className="-mt-0.5">
                                    결제 동의 (구매조건 확인 및 결제진행에 동의)
                                </span>
                            </label>
                        </section>

                        {/* 결제 버튼 */}
                        <button
                            type="submit"
                            className="font-pretendard-bold w-full bg-black py-3 pb-4 text-white"
                        >
                            결제하기
                        </button>
                    </div>
                </div>
                {isOpen && (
                    <AddressModal
                        onComplete={onComplete}
                        onClose={closeModal}
                    />
                )}
            </form>
        );
};

export default Order;
