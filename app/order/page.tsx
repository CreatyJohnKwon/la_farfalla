"use client";

import { useEffect } from "react";
import Image from "next/image";
import useOrder from "@src/shared/hooks/useOrder";

import DefaultImage from "../../public/images/chill.png";
import { useAddress } from "@/src/shared/hooks/useAddress";
import AddressModal from "@/src/features/address/AddressModal";
import { IUserCouponPopulated } from "@/src/entities/type/interfaces";

const Order = () => {
    const { orderDatas } = useOrder();
    const { isOpen, openModal, closeModal, onComplete, formatPhoneNumber } =
        useAddress();
    const {
        user,
        isLoading,
        coupons,
        isCouponsLoading,

        mileage,
        setMileage,
        usedMileage,
        setUsedMileage,
        deliveryMemo,
        setDeliveryMemo,
        customMemo,
        setCustomMemo,
        couponMemo,
        setCouponMemo,
        useCoupon,
        setUseCoupon,
        applyCoupon,
        setApplyCoupon,
        totalPrice,
        setTotalPrice,
        totalMileage,
        setTotalMileage,
        appliedCouponName,
        setAppliedCouponName,
        phoneNumber,
        setPhoneNumber,
        address,
        setAddress,
        postcode,
        setPostcode,
        detailAddress,
        setDetailAddress,
        setSaveAddress,
        setPayments,

        orderComplete,
    } = useOrder();

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
                (1 - applyCoupon / 100) -
            usedMileage;

        setTotalPrice(Math.floor(discountedPrice));
        setTotalMileage(Math.floor(discountedPrice * 0.01));
    }, [usedMileage, applyCoupon, orderDatas]);

    useEffect(() => {
        if (!user) return;

        setPhoneNumber(user.phoneNumber);
        setAddress(user.address);
        setDetailAddress(user.detailAddress);
        setPostcode(user.postcode);
        setMileage(user.mileage);
    }, [user]);

    useEffect(() => {
        if (!user) return;

        setMileage(user.mileage - usedMileage);
    }, [usedMileage]);

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

                    if (deliveryMemo === "custom" && customMemo === "")
                        return alert("배송 메모를 확인해주세요.");

                    orderComplete();
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
                                                    ? product.image
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
                                    <input
                                        name="postcode"
                                        value={postcode}
                                        onChange={(e) =>
                                            setPostcode(e.target.value)
                                        }
                                        readOnly
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            openModal((value) => {
                                                setAddress(value.address);
                                                setPostcode(value.zonecode);
                                            })
                                        }
                                        className="font-pretendard-bold absolute right-1 top-1/3 bg-black px-5 py-[0.7vh] text-sm text-white hover:bg-gray-800"
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
                                <option value="문 앞에 두고 가주세요.">
                                    문 앞에 두고 가주세요.
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
                                    className="mt-1 w-full border p-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
                                />
                            )}

                            {/* custom akkk */}
                            <label className="mt-4 flex items-center gap-2 justify-self-end font-pretendard text-sm leading-tight">
                                <input
                                    type="checkbox"
                                    name="saveAddress"
                                    onChange={(e) =>
                                        setSaveAddress(e.target.checked)
                                    }
                                />
                                <span>다음에도 이 주소 사용하기</span>
                            </label>
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
                                        // ✅ IUserCouponPopulated 구조에서 찾기
                                        const selectedUserCoupon =
                                            coupons?.find(
                                                (uc: IUserCouponPopulated) =>
                                                    uc.couponId?.name ===
                                                    selectedName,
                                            );
                                        if (
                                            selectedUserCoupon &&
                                            selectedUserCoupon.couponId
                                        ) {
                                            setCouponMemo(e.target.value);
                                            setUseCoupon(
                                                +selectedUserCoupon.couponId
                                                    .discountValue,
                                            );
                                        }
                                    }}
                                    className="w-full appearance-none border border-gray-300 bg-white p-3 pr-8 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-200"
                                >
                                    <option value="">
                                        적용할 쿠폰을 선택해주세요.
                                    </option>
                                    {!isCouponsLoading &&
                                        coupons
                                            ?.filter((userCoupon) => {
                                                // 사용 가능한 쿠폰만 필터링
                                                if (
                                                    userCoupon.isUsed ||
                                                    !userCoupon.couponId
                                                )
                                                    return false;

                                                const coupon =
                                                    userCoupon.couponId;
                                                const now = new Date();
                                                const currentOrderAmount =
                                                    orderDatas.reduce(
                                                        (acc, p) =>
                                                            acc +
                                                            p.discountPrice *
                                                                p.quantity,
                                                        0,
                                                    );

                                                return (
                                                    coupon.isActive &&
                                                    new Date(coupon.startAt) <=
                                                        now &&
                                                    new Date(coupon.endAt) >=
                                                        now &&
                                                    coupon.minOrderAmount <=
                                                        currentOrderAmount
                                                );
                                            })
                                            ?.map(
                                                (
                                                    userCoupon: IUserCouponPopulated,
                                                    index: number,
                                                ) => {
                                                    const coupon =
                                                        userCoupon.couponId;
                                                    return (
                                                        <option
                                                            key={`cp_${index}`}
                                                            value={coupon.name}
                                                        >
                                                            {coupon.name}
                                                            {/* ✅ ICoupon 구조에 맞춘 할인 정보 표시 */}
                                                            {coupon.discountType ===
                                                            "percentage"
                                                                ? ` (${coupon.discountValue}% 할인)`
                                                                : ` (${coupon.discountValue.toLocaleString()}원 할인)`}
                                                            {/* 최대 할인 금액 정보 */}
                                                            {coupon.discountType ===
                                                                "percentage" &&
                                                                coupon.maxDiscountAmount &&
                                                                ` [최대 ${coupon.maxDiscountAmount.toLocaleString()}원]`}
                                                        </option>
                                                    );
                                                },
                                            )}
                                </select>
                                <button
                                    type="button"
                                    className="font-pretendard-bold absolute right-1 top-1/2 -translate-y-1/2 bg-black px-5 py-[0.7vh] text-sm text-white hover:bg-gray-800"
                                    onClick={() => {
                                        const selectedUserCoupon =
                                            coupons?.find(
                                                (uc: IUserCouponPopulated) =>
                                                    uc.couponId?.name ===
                                                    couponMemo,
                                            );

                                        if (selectedUserCoupon?.couponId) {
                                            setApplyCoupon(useCoupon);
                                            setAppliedCouponName(couponMemo);
                                        }
                                    }}
                                    disabled={couponMemo === ""}
                                >
                                    적용
                                </button>
                            </div>

                            {applyCoupon !== 0 && appliedCouponName && (
                                <div className="mt-4 flex items-center justify-between border border-dashed border-gray-400 bg-gray-50 px-4 py-3 text-sm">
                                    <div>
                                        <span className="font-pretendard">
                                            {`${appliedCouponName} 쿠폰이 적용되었습니다.\t`}
                                        </span>
                                        <span className="text-gray-500">
                                            {(() => {
                                                const selectedUserCoupon =
                                                    coupons?.find(
                                                        (
                                                            uc: IUserCouponPopulated,
                                                        ) =>
                                                            uc.couponId
                                                                ?.name ===
                                                            appliedCouponName,
                                                    );

                                                if (
                                                    selectedUserCoupon?.couponId
                                                ) {
                                                    const coupon =
                                                        selectedUserCoupon.couponId;
                                                    if (
                                                        coupon.discountType ===
                                                        "percentage"
                                                    ) {
                                                        return `(${applyCoupon}% 할인)`;
                                                    } else {
                                                        return `(${applyCoupon.toLocaleString()}원 할인)`;
                                                    }
                                                }
                                                return `(${applyCoupon}% 할인)`;
                                            })()}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCouponMemo("");
                                            setUseCoupon(0);
                                            setApplyCoupon(0);
                                            setAppliedCouponName("");
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
                                {user.mileage > 0 || user.mileage ? (
                                    <>
                                        <span className="text-sm">
                                            {`사용 가능 적립금`}
                                            <span className="font-amstel ms-2">
                                                {mileage.toLocaleString()}
                                            </span>
                                            <input
                                                className="font-amstel ms-4 mt-1 w-12 rounded-none border-b text-black focus:outline-none focus:ring-1 focus:ring-gray-200"
                                                type="text"
                                                name="useMileage"
                                                value={
                                                    usedMileage !== 0
                                                        ? usedMileage.toLocaleString()
                                                        : ""
                                                }
                                                onChange={(e) => {
                                                    const raw =
                                                        e.target.value.replace(
                                                            /[^0-9]/g,
                                                            "",
                                                        );
                                                    const value = Number(raw);

                                                    if (value > user.mileage) {
                                                        alert(
                                                            "사용 가능한 적립금보다 많습니다.",
                                                        );
                                                        return;
                                                    }

                                                    setUsedMileage(value);
                                                }}
                                                placeholder={"0"}
                                            />
                                        </span>
                                        <label className="flex items-center gap-1 text-sm">
                                            <input
                                                type="checkbox"
                                                name="usePoint"
                                                onChange={(e) => {
                                                    const checked =
                                                        e.target.checked;
                                                    checked
                                                        ? setUsedMileage(
                                                              Number(
                                                                  user.mileage,
                                                              ),
                                                          )
                                                        : setUsedMileage(0);
                                                }}
                                            />
                                            전액사용
                                        </label>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-sm">
                                            {`사용 가능 적립금`}
                                            <span className="font-amstel ms-2">
                                                {mileage.toLocaleString()}
                                            </span>
                                        </span>
                                    </>
                                )}
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
                                    {`KRW ${totalPrice.toLocaleString()}`}
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
                                    {`KRW ${totalPrice.toLocaleString()}`}
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
                                    {`${totalMileage.toLocaleString()} Mileage`}
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
                                        defaultChecked
                                        onChange={() => setPayments("간편결제")}
                                    />
                                    {"\t간편결제"}
                                </label>
                                <label className="flex items-center gap-2 text-sm">
                                    <input
                                        type="radio"
                                        name="payment"
                                        onChange={() => setPayments("신용카드")}
                                    />
                                    {"\t신용카드"}
                                </label>
                            </div>
                        </section>

                        {/* 약관 동의 */}
                        <section className="border bg-white p-4 font-pretendard">
                            <label className="flex items-center gap-2 text-sm leading-tight">
                                <input
                                    type="checkbox"
                                    name="paymentAgree"
                                    required
                                />
                                <span className="font-pretendard">
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
