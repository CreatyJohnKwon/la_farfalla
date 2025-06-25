import { useRouter } from "next/navigation";
import useUser from "@src/shared/hooks/useUsers";
import {
    IUserCouponPopulated,
    SelectedItem,
} from "@src/entities/type/interfaces";
import { useAtom } from "jotai";
import { orderDatasAtom } from "../lib/atom";
import { useState, useEffect } from "react";
import { useUserQuery } from "@src/shared/hooks/react-query/useUserQuery";
import {
    useGetUserCouponsListQuery,
    useUpdateUserCouponMutation,
} from "@src/shared/hooks/react-query/useBenefitQuery";
import { MileageItem, OrderData } from "@/src/entities/type/interfaces";
import { orderAccept } from "@/src/features/order/order";
import { redirect } from "next/navigation";
import { earnMileage, spendMileage } from "@/src/features/benefit/mileage";
import { updateUser } from "../lib/server/user";

const useOrder = () => {
    const { session } = useUser();
    const router = useRouter();
    const { data: user, isLoading } = useUserQuery();

    // ✅ IUserCouponPopulated 배열로 타입 지정
    const { data: coupons, isLoading: isCouponsLoading } =
        useGetUserCouponsListQuery("user");

    const updateCoupon = useUpdateUserCouponMutation();

    const [orderDatas, setOrderDatas] = useAtom<SelectedItem[] | []>(
        orderDatasAtom,
    );
    const [mileage, setMileage] = useState<number>(0);
    const [usedMileage, setUsedMileage] = useState<number>(0);
    const [useCoupon, setUseCoupon] = useState<number>(0);
    const [applyCoupon, setApplyCoupon] = useState<number>(0);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [totalMileage, setTotalMileage] = useState<number>(0);
    const [deliveryMemo, setDeliveryMemo] = useState<string>("");
    const [customMemo, setCustomMemo] = useState<string>("");
    const [couponMemo, setCouponMemo] = useState<string>("");
    const [appliedCouponName, setAppliedCouponName] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [postcode, setPostcode] = useState<string>("");
    const [detailAddress, setDetailAddress] = useState<string>("");
    const [saveAddress, setSaveAddress] = useState<boolean>(false);
    const [payments, setPayments] = useState<"간편결제" | "신용카드">(
        "간편결제",
    );

    // ✅ 가격 계산 로직 (ICoupon 구조 고려)
    useEffect(() => {
        if (!orderDatas) return;

        // 기본 주문 금액
        const basePrice = orderDatas.reduce(
            (acc, p) => acc + p.discountPrice * p.quantity,
            0,
        );

        // 쿠폰 할인 계산
        let couponDiscount = 0;
        if (applyCoupon !== 0 && couponMemo) {
            const selectedUserCoupon = coupons?.data?.find(
                (uc) => uc.couponId.name === couponMemo,
            );

            if (selectedUserCoupon?.couponId) {
                const coupon = selectedUserCoupon.couponId;

                if (coupon.discountType === "percentage") {
                    couponDiscount = basePrice * (applyCoupon / 100);
                } else if (coupon.discountType === "fixed") {
                    couponDiscount = applyCoupon;
                    if (couponDiscount > basePrice) {
                        couponDiscount = basePrice;
                    }
                }
            }
        }

        const discountedPrice = basePrice - couponDiscount - usedMileage;

        setTotalPrice(Math.max(0, Math.floor(discountedPrice)));
        setTotalMileage(Math.floor(discountedPrice * 0.01));
    }, [usedMileage, applyCoupon, orderDatas, couponMemo, coupons]);

    // ✅ 다른 useEffect들...
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

    const orderComplete = async () => {
        if (!user) return;

        const orderData: OrderData = {
            userId: user._id,
            userNm: user.name,
            phoneNumber: phoneNumber,
            address: address,
            detailAddress: detailAddress,
            postcode: postcode,
            deliveryMemo: customMemo ? customMemo : deliveryMemo,
            items: orderDatas.map((item) => ({
                productId: item.productId,
                productNm: item.title,
                quantity: item.quantity,
                color: item.color,
                size: item.size,
            })),
            payMethod: payments,
            shippingStatus: "pending",
            totalPrice: totalPrice,
        };

        const res = await orderAccept(orderData);

        if (res.success) {
            useSpendCoupon();
            useSpendMileage(res);
            addEarnMileage(res);
            saveNewAddress();

            alert(res.message);
            redirect(`/home`);
        } else alert(res.message);
    };

    // ✅ IUserCoupon 구조에 맞춘 쿠폰 사용 함수
    const useSpendCoupon = () => {
        const userCoupons = coupons?.data || [];

        if (userCoupons.length === 0) {
            alert("사용 가능한 쿠폰이 없습니다.");
            setCouponMemo("");
            return;
        }

        // IUserCouponPopulated 구조에서 쿠폰 찾기
        const selected = userCoupons.find((uc: any) => {
            if (!uc.couponId || typeof uc.couponId === "string") {
                console.error("쿠폰 정보가 올바르게 로드되지 않았습니다.");
                return false;
            }
            return uc.couponId.name === couponMemo;
        });

        if (!selected) {
            alert("선택하신 쿠폰을 찾을 수 없습니다.");
            setCouponMemo("");
            return;
        }

        if (selected.isUsed) {
            alert("이미 사용된 쿠폰입니다.");
            setCouponMemo("");
            return;
        }

        // ICoupon 구조에 맞춰 검증
        const coupon = selected.couponId;

        // ✅ 수정: 명시적으로 true인지 확인
        if (coupon.isActive !== true) {
            alert("비활성화된 쿠폰입니다.");
            setCouponMemo("");
            return;
        }

        const now = new Date();
        if (new Date(coupon.startAt) > now) {
            alert("아직 사용할 수 없는 쿠폰입니다.");
            setCouponMemo("");
            return;
        }

        if (new Date(coupon.endAt) < now) {
            alert("만료된 쿠폰입니다.");
            setCouponMemo("");
            return;
        }

        if (!selected._id) {
            alert("쿠폰 ID가 없습니다.");
            setCouponMemo("");
            return;
        }

        // IUserCoupon의 _id로 업데이트
        updateCoupon.mutate(selected._id, {
            onSuccess: () => {
                console.log(`${coupon.name} coupons success`);
            },
            onError: (error) => {
                console.error("쿠폰 사용 오류:", error);
                alert(
                    "쿠폰 정보 저장에 오류가 발생했습니다\n채널톡에 문의해주세요",
                );
            },
        });

        setCouponMemo("");
    };

    const useSpendMileage = (res: any) => {
        if (usedMileage > 0 && res) {
            const useSpendMileage: MileageItem = {
                userId: user?._id,
                type: "spend",
                amount: usedMileage,
                description: "마일리지 사용",
                relatedOrderId: res.orderId,
                createdAt: new Date().toISOString(),
            };
            spendMileage(useSpendMileage);
        }
    };

    const addEarnMileage = (res: any) => {
        const addMileage: MileageItem = {
            userId: user?._id,
            type: "earn",
            amount: totalMileage,
            description: "마일리지 적립",
            relatedOrderId: res?.orderId,
            createdAt: new Date().toISOString(),
        };
        earnMileage(addMileage);
    };

    const saveNewAddress = async () => {
        if (saveAddress === false) return;

        const updateAddress = {
            address,
            detailAddress,
            postcode,
        };

        await updateUser(updateAddress);
    };

    return {
        user,
        isLoading,
        coupons, // ✅ IUserCouponPopulated 배열 반환
        isCouponsLoading,

        orderDatas,
        setOrderDatas,
        session,
        router,
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
        saveAddress,
        setSaveAddress,
        setPayments,

        orderComplete,
    };
};

export default useOrder;
