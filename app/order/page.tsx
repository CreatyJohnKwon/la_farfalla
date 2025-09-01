"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import useOrder from "@src/shared/hooks/useOrder";

import DefaultImage from "../../public/images/chill.png";
import { useAddress } from "@/src/shared/hooks/useAddress";
import AddressModal from "@/src/features/address/AddressModal";
import LoadingSpinner from "@/src/widgets/spinner/LoadingSpinner";
import AgreementModal from "@/src/widgets/modal/Agreement/AgreementModal";
import BuyAgreement from "@/src/components/agreement/BuyAgreement";

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
        totalMileage,
        appliedCouponName,
        setAppliedCouponName,

        recipientName,
        setRecipientName,
        phoneNumber,
        setPhoneNumber,
        address,
        setAddress,
        postcode,
        setPostcode,
        detailAddress,
        setDetailAddress,
        setSaveAddress,

        orderComplete,
        isSubmitting
    } = useOrder();
    const [isOpenAgreementModal, setIsOpenAgreementModal] = useState<boolean>(false);

    // ✅ 쿠폰 데이터 추출 및 최적화
    const couponData = useMemo(() => coupons?.data || [], [coupons]);

    // ✅ 조건 1: 활성화된 쿠폰만 필터링 (isActive === true인 것만)
    const availableCoupons = useMemo(() => {
        if (!couponData.length || !orderDatas.length) return [];

        const now = new Date();

        const filtered = couponData.filter((userCoupon: any) => {
            const coupon = userCoupon.couponId;

            // ✅ 조건 1: isActive가 명시적으로 true인 경우만 허용
            const isActive = coupon.isActive === true;
            const isStarted = new Date(coupon.startAt) <= now;
            const isNotExpired = new Date(coupon.endAt) >= now;
            const isNotUsed = !userCoupon.isUsed;

            return isActive && isStarted && isNotExpired && isNotUsed;
        });

        return filtered;
    }, [couponData, orderDatas]);

    // ✅ 조건 2: 쿠폰 선택 시 비활성화된 쿠폰이면 선택 해제
    const handleCouponSelect = (selectedName: string) => {
        if (!selectedName) {
            setCouponMemo("");
            setUseCoupon(0);
            return;
        }

        const selectedUserCoupon = couponData.find(
            (uc: any) => uc.couponId?.name === selectedName,
        );

        if (selectedUserCoupon?.couponId) {
            const coupon = selectedUserCoupon.couponId;

            // ✅ 조건 2: 비활성화된 쿠폰 선택 시 초기화
            if (coupon.isActive !== true) {
                alert("비활성화된 쿠폰입니다. 다른 쿠폰을 선택해주세요.");
                setCouponMemo(""); // 초기값으로 되돌림
                setUseCoupon(0);
                return;
            }

            setCouponMemo(selectedName);
            setUseCoupon(+coupon.discountValue);
        }
    };

    // ✅ 쿠폰 적용 핸들러
    const handleApplyCoupon = () => {
        if (!couponMemo) {
            alert("먼저 쿠폰을 선택해주세요.");
            return;
        }

        const selectedUserCoupon = couponData.find(
            (uc: any) => uc.couponId?.name === couponMemo,
        );

        if (selectedUserCoupon?.couponId) {
            const coupon = selectedUserCoupon.couponId;

            // 한 번 더 활성화 상태 확인
            if (coupon.isActive !== true) {
                alert("비활성화된 쿠폰입니다.");
                setCouponMemo("");
                setUseCoupon(0);
                return;
            }

            setApplyCoupon(useCoupon);
            setAppliedCouponName(couponMemo);
        } else {
            alert("쿠폰 정보를 찾을 수 없습니다.");
        }
    };

    // ✅ 조건 3: 결제 전 최종 쿠폰 상태 검증
    const validateCouponBeforePayment = () => {
        // 쿠폰을 사용하지 않는 경우는 통과
        if (!appliedCouponName || applyCoupon === 0) {
            return true;
        }

        const selectedUserCoupon = couponData.find(
            (uc: any) => uc.couponId?.name === appliedCouponName,
        );

        if (!selectedUserCoupon?.couponId) {
            alert("적용된 쿠폰 정보를 찾을 수 없습니다.");
            return false;
        }

        const coupon = selectedUserCoupon.couponId;

        // ✅ 조건 3: 결제 시점에 쿠폰 활성화 상태 재검증
        if (coupon.isActive !== true) {
            alert(
                "적용된 쿠폰이 비활성화되었습니다. 쿠폰을 다시 선택해주세요.",
            );
            // 쿠폰 정보 초기화
            handleRemoveCoupon();
            return false;
        }

        // 추가 검증: 만료일, 시작일 등도 재확인
        const now = new Date();
        if (new Date(coupon.startAt) > now) {
            alert("쿠폰 사용 기간이 아직 시작되지 않았습니다.");
            handleRemoveCoupon();
            return false;
        }

        if (new Date(coupon.endAt) < now) {
            alert("쿠폰이 만료되었습니다.");
            handleRemoveCoupon();
            return false;
        }

        if (selectedUserCoupon.isUsed) {
            alert("이미 사용된 쿠폰입니다.");
            handleRemoveCoupon();
            return false;
        }

        return true;
    };

    // ✅ 쿠폰 삭제 핸들러 (조건 2에서도 사용)
    const handleRemoveCoupon = () => {
        setCouponMemo("");
        setUseCoupon(0);
        setApplyCoupon(0);
        setAppliedCouponName("");
    };

    // ✅ 적용된 쿠폰 정보 가져오기
    const getAppliedCouponInfo = () => {
        const selectedUserCoupon = couponData.find(
            (uc) => uc.couponId?.name === appliedCouponName,
        );

        if (selectedUserCoupon?.couponId) {
            const coupon = selectedUserCoupon.couponId;
            if (coupon.discountType === "percentage") {
                return `(${applyCoupon}% 할인)`;
            } else {
                return `(${applyCoupon.toLocaleString()}원 할인)`;
            }
        }
        return `(${applyCoupon}% 할인)`;
    };

    // ✅ 적립금 관련 핸들러들
    const handleMileageChange = (value: string) => {
        const raw = value.replace(/[^0-9]/g, "");
        const numValue = Number(raw);

        if (numValue > user.mileage) {
            alert("사용 가능한 적립금보다 많습니다.");
            return;
        }

        setUsedMileage(numValue);
    };

    const handleUseAllMileage = (checked: boolean) => {
        setUsedMileage(checked ? Number(user.mileage) : 0);
    };

    // ✅ 적립금 표시 포맷팅
    const formatMileage = (amount: number) => amount.toLocaleString();

    // ✅ useEffect들
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

            if (!orderDatas || !isDesktop) return;

            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [orderDatas]);

    useEffect(() => {
        if (!user) return;

        setPhoneNumber(user.phoneNumber);
        setAddress(user.address);
        setDetailAddress(user.detailAddress);
        setPostcode(user.postcode);
        setMileage(user.mileage);
        setAppliedCouponName(user.name);
    }, [user]);

    useEffect(() => {
        if (!user) return;

        setMileage(user.mileage - usedMileage);
    }, [usedMileage]);

    // ✅ 수정된 form submit 핸들러
    const handleFormSubmit = (e: any) => {
        e.preventDefault();

        // 기존 검증들
        if (!recipientName || recipientName.trim() === "") {
            return alert("수령인 이름을 입력해주세요.");
        }

        if (phoneNumber === "000-0000-0000" || phoneNumber.length < 11) {
            return alert("전화번호를 확인해주세요.");
        }

        if (address === "" || detailAddress === "") {
            return alert("주소를 확인해주세요.");
        }

        if (deliveryMemo === "custom" && customMemo === "") {
            return alert("배송 메모를 확인해주세요.");
        }

        // ✅ 조건 3: 결제 전 쿠폰 상태 최종 검증
        if (!validateCouponBeforePayment()) {
            return; // 검증 실패 시 결제 진행 중단
        }

        // 모든 검증 통과 시 주문 완료 진행
        orderComplete();
    };

    if (user && !isLoading && orderDatas.length > 0)
        return (
            <form
                onSubmit={handleFormSubmit} // ✅ 새로운 핸들러 사용
                className="h-full min-h-screen w-full bg-gray-50 pt-16 md:pt-24"
            >
                {/* 로딩 중일 때 오버레이 스피너 표시 */}
                {isSubmitting && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <LoadingSpinner size="lg" message="Order processing..." />
                    </div>
                )}

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
                                        className="flex gap-4 p-2 ps-0"
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
                                            <span className="font-pretendard font-[300]">
                                                {product?.title}
                                            </span>
                                            <span className="font-amstel">
                                                - {product?.color}
                                            </span>
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
                                <p className="font-amstel mt-1">
                                    {user.phoneNumber}
                                </p>

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
                                <div className="w-[50%] space-y-3">
                                    <div>
                                        <label className="mb-1 block text-xs text-gray-600">
                                            수령인 이름
                                        </label>
                                        <input
                                            className="w-full border-b border-gray-300 bg-white text-sm focus:border-gray-500 focus:outline-none"
                                            type="text"
                                            value={recipientName}
                                            name="recipientName"
                                            onChange={(e) =>
                                                setRecipientName(e.target.value)
                                            }
                                            placeholder="홍길동"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-gray-600">
                                            수령인 전화번호
                                        </label>
                                        <input
                                            className="w-full border-b border-gray-300 bg-white text-sm focus:border-gray-500 focus:outline-none"
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
                                                phoneNumber.startsWith("02")
                                                    ? 12
                                                    : 13
                                            }
                                            placeholder="000-0000-0000"
                                        />
                                    </div>
                                </div>

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
                                        className="font-pretendard-bold absolute right-1 top-1/3 bg-black px-5 py-[0.9vh] text-sm text-white hover:bg-gray-800"
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

                        {/* ✅ 개선된 쿠폰 섹션 */}
                        <section className="border bg-white p-4">
                            <h2 className="font-pretendard-bold mb-5 flex items-center justify-between">
                                <span>쿠폰</span>
                                <span className="text-sm font-normal text-gray-500">
                                    {couponData.reduce((a, c) => {
                                        if (!c.isUsed) {
                                            return a + 1;
                                        }
                                        return a;
                                    }, 0)}
                                    개 보유
                                </span>
                            </h2>

                            {/* 로딩 상태 */}
                            {isCouponsLoading ? (
                                <LoadingSpinner
                                    size="sm"
                                    fullScreen={false}
                                    message="Loading..."
                                />
                            ) : !couponData.length ? (
                                /* 쿠폰 없음 상태 */
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-center">
                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                            <svg
                                                className="h-6 w-6 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            보유한 쿠폰이 없습니다.
                                        </p>
                                    </div>
                                </div>
                            ) : availableCoupons.length === 0 ? (
                                /* 사용 가능한 쿠폰 없음 상태 */
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center py-6">
                                        <div className="text-center">
                                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                                                <svg
                                                    className="h-6 w-6 text-orange-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                현재 주문에 사용 가능한 쿠폰이
                                                없습니다.
                                            </p>
                                            {/* <p className="mt-1 text-xs text-gray-400">
                                                (총 {couponData.length}개 쿠폰
                                                보유 중)
                                            </p> */}
                                        </div>
                                    </div>

                                    {/* 사용 불가능한 쿠폰들 표시 */}
                                    {/* <div className="rounded-md bg-gray-50 p-3">
                                        <p className="mb-2 text-xs font-medium text-gray-600">
                                            💡 보유 중인 쿠폰들:
                                        </p>
                                        <div className="space-y-2">
                                            {couponData
                                                .slice(0, 3)
                                                .map((userCoupon, index) => {
                                                    const coupon =
                                                        userCoupon.couponId;
                                                    if (!coupon) return null;

                                                    const now = new Date();
                                                    const currentOrderAmount =
                                                        orderDatas.reduce(
                                                            (acc, p) =>
                                                                acc +
                                                                p.discountPrice *
                                                                    p.quantity,
                                                            0,
                                                        );

                                                    let reason = "";
                                                    if (userCoupon.isUsed)
                                                        reason = "이미 사용됨";
                                                    else if (!coupon.isActive)
                                                        reason = "비활성화됨";
                                                    else if (
                                                        new Date(
                                                            coupon.startAt,
                                                        ) > now
                                                    )
                                                        reason =
                                                            "아직 시작 안됨";
                                                    else if (
                                                        new Date(coupon.endAt) <
                                                        now
                                                    )
                                                        reason = "만료됨";

                                                    return (
                                                        <div
                                                            key={`unavailable_${index}`}
                                                            className="flex items-center justify-between text-xs"
                                                        >
                                                            <span className="text-gray-600">
                                                                {coupon.name}
                                                            </span>
                                                            <span className="font-medium text-red-500">
                                                                {reason}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            {couponData.length > 3 && (
                                                <p className="text-xs text-gray-500">
                                                    외 {couponData.length - 3}개
                                                    더...
                                                </p>
                                            )}
                                        </div>
                                    </div> */}
                                </div>
                            ) : (
                                /* 쿠폰 선택 영역 */
                                <div className="space-y-4">
                                    <div className="relative flex w-full gap-2">
                                        <select
                                            name="coupon"
                                            value={couponMemo}
                                            onChange={(e) =>
                                                handleCouponSelect(
                                                    e.target.value,
                                                )
                                            } // ✅ 수정된 핸들러
                                            className="w-full appearance-none border border-gray-300 bg-white p-3 pr-16 text-sm text-gray-800 transition-colors focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                        >
                                            <option value="">
                                                적용할 쿠폰을 선택해주세요 (
                                                {availableCoupons.length}개
                                                사용가능)
                                            </option>
                                            {availableCoupons.map(
                                                (userCoupon, index) => {
                                                    const coupon =
                                                        userCoupon.couponId;
                                                    return (
                                                        <option
                                                            key={`cp_${index}`}
                                                            value={coupon.name}
                                                        >
                                                            {coupon.name}
                                                            {coupon.discountType ===
                                                            "percentage"
                                                                ? ` (${coupon.discountValue}% 할인)`
                                                                : ` (${coupon.discountValue.toLocaleString()}원 할인)`}
                                                        </option>
                                                    );
                                                },
                                            )}
                                        </select>

                                        <button
                                            type="button"
                                            className="font-pretendard-bold absolute right-1 top-1/2 -translate-y-1/2 bg-black px-5 py-2 text-sm text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                                            onClick={handleApplyCoupon}
                                            disabled={couponMemo === ""}
                                        >
                                            적용
                                        </button>
                                    </div>

                                    {/* 사용 가능한 쿠폰 미리보기 */}
                                    <div className="rounded bg-gray-50 p-3 text-xs text-gray-600">
                                        <p className="mb-1 font-medium">
                                            💡 사용 가능한 쿠폰:
                                        </p>
                                        <div className="space-y-1">
                                            {availableCoupons
                                                .slice(0, 3)
                                                .map((userCoupon, index) => {
                                                    const coupon =
                                                        userCoupon.couponId;
                                                    return (
                                                        <div
                                                            key={`preview_${index}`}
                                                            className="flex justify-between"
                                                        >
                                                            <span>
                                                                {coupon.name}
                                                            </span>
                                                            <span className="font-medium text-blue-600">
                                                                {coupon.discountType ===
                                                                "percentage"
                                                                    ? `${coupon.discountValue}% 할인`
                                                                    : `${coupon.discountValue.toLocaleString()}원 할인`}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            {availableCoupons.length > 3 && (
                                                <p className="text-gray-500">
                                                    외{" "}
                                                    {availableCoupons.length -
                                                        3}
                                                    개 더...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ✅ 적용된 쿠폰 표시 부분 */}
                            {applyCoupon !== 0 && appliedCouponName && (
                                <div className="mt-4 rounded-md border border-dashed border-green-300 bg-green-50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                                                <svg
                                                    className="h-4 w-4 text-green-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-pretendard font-medium text-green-800">
                                                    {appliedCouponName} 쿠폰
                                                    적용됨
                                                </p>
                                                <p className="text-sm text-green-600">
                                                    {getAppliedCouponInfo()}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleRemoveCoupon}
                                            className="ml-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-400 transition-colors hover:border-red-300 hover:text-red-500"
                                            aria-label="쿠폰 삭제"
                                        >
                                            <svg
                                                className="h-4 w-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* ✅ 개선된 적립금 섹션 */}
                        <section className="border bg-white p-4">
                            <h2 className="font-pretendard-bold mb-4 flex items-center justify-between">
                                <span>적립금</span>
                                <span className="text-sm font-normal text-gray-500">
                                    보유:
                                    <span className="font-amstel">
                                        {" "}
                                        {formatMileage(user.mileage || 0)}{" "}
                                    </span>
                                    마일리지
                                </span>
                            </h2>

                            {/* 적립금이 없는 경우 */}
                            {!user.mileage || user.mileage <= 0 ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-center">
                                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                            <svg
                                                className="h-6 w-6 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            사용 가능한 적립금이 없습니다.
                                        </p>
                                        <p className="mt-1 text-xs text-gray-400">
                                            구매 후 적립금을 받아보세요!
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                /* 적립금 사용 영역 */
                                <div className="space-y-4">
                                    <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                                                    <svg
                                                        className="h-3 w-3 text-blue-600"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </div>
                                                <span className="text-sm font-medium text-blue-800">
                                                    사용 가능 적립금
                                                </span>
                                            </div>
                                            <div className="text-blue-900">
                                                <span className="font-amstel">
                                                    {formatMileage(
                                                        mileage,
                                                    )}{" "}
                                                </span>
                                                <span className="font-pretendard font-[300]">
                                                    마일리지
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        name="useMileage"
                                                        value={
                                                            usedMileage !== 0
                                                                ? formatMileage(
                                                                      usedMileage,
                                                                  )
                                                                : ""
                                                        }
                                                        onChange={(e) =>
                                                            handleMileageChange(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="사용할 적립금 입력"
                                                        className="w-full rounded-md border border-gray-300 px-3 py-2 pr-8 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                                                        마일리지
                                                    </span>
                                                </div>
                                            </div>
                                            <label className="flex items-center gap-2 whitespace-nowrap text-sm">
                                                <input
                                                    type="checkbox"
                                                    name="usePoint"
                                                    onChange={(e) =>
                                                        handleUseAllMileage(
                                                            e.target.checked,
                                                        )
                                                    }
                                                    checked={
                                                        usedMileage ===
                                                        user.mileage
                                                    }
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">
                                                    전액사용
                                                </span>
                                            </label>
                                        </div>

                                        {/* 사용 적립금 표시 */}
                                        {usedMileage > 0 && (
                                            <div className="mt-3 rounded-md border border-blue-200 bg-white p-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        사용 적립금:
                                                    </span>
                                                    <span className="font-medium text-red-600">
                                                        -{" "}
                                                        <span className="font-amstel">
                                                            {formatMileage(
                                                                usedMileage,
                                                            )}
                                                        </span>{" "}
                                                        마일리지
                                                    </span>
                                                </div>
                                                <div className="mt-1 flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        잔여 적립금:
                                                    </span>
                                                    <span className="font-medium text-blue-600">
                                                        <span className="font-amstel">
                                                            {formatMileage(
                                                                user.mileage -
                                                                    usedMileage,
                                                            )}
                                                        </span>{" "}
                                                        마일리지
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 적립금 안내 */}
                                    <div className="rounded-md bg-gray-50 p-3">
                                        <div className="flex items-start gap-2">
                                            <svg
                                                className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            <div className="text-xs text-gray-600">
                                                <p>
                                                    • 적립금은 1 마일리지 단위로
                                                    사용 가능합니다.
                                                </p>
                                                <p>
                                                    • 결제 금액이 적립금보다
                                                    작을 경우, 결제 금액만큼만
                                                    사용됩니다.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                    {`\t${totalMileage.toLocaleString()}\t`}
                                </span>
                                <span>마일리지 적립 예정 (주문 확정 시)</span>
                                <input
                                    type="text"
                                    name="totalMileage"
                                    value={totalMileage}
                                    className="hidden"
                                    readOnly
                                />
                            </p>
                        </section>

                        {/* 약관 동의 */}
                        <section className="border bg-white p-4 font-pretendard">
                            <label className="flex items-center gap-2 text-sm leading-tight">
                                <input
                                    type="checkbox"
                                    name="paymentAgree"
                                    required
                                />
                                <div>
                                    <span className="font-pretendard">
                                        {"결제\t및\t"}
                                    </span>
                                    <span 
                                        className="font-pretendard underline cursor-pointer hover:text-blue-500" 
                                        onClick={(e) => {
                                            e.preventDefault(); // 이벤트 전이 막고
                                            setIsOpenAgreementModal(true); // 약관동의 모달 열기
                                        }}
                                    >
                                        {"약관\t동의\t"}
                                    </span>
                                    <span className="font-pretendard">
                                        {"구매조건\t확인\t및\t결제진행에 동의\t(필수)"}
                                    </span>
                                </div>
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
                {isOpenAgreementModal && (
                    <AgreementModal 
                        onClose={() => setIsOpenAgreementModal(false)}
                        children={<BuyAgreement />}
                    />
                )}
            </form>
        );

    if (isLoading) {
        return <LoadingSpinner size="lg" message="Loading Order Details..." />;
    }

    if (!user || orderDatas.length === 0) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-center">
                    <h2 className="mb-2 text-xl font-bold text-gray-700">
                        주문할 상품이 없습니다.
                    </h2>
                    <p className="text-gray-600">상품을 담아주세요.</p>
                </div>
            </div>
        );
    }
    return null; // 모든 조건에 해당하지 않을 경우 아무것도 렌더링하지 않음
};

export default Order;
