import { useRouter } from "next/navigation";
import useUser from "@src/shared/hooks/useUsers";
import {
    SelectedItem,
    UserCouponWithPopulate,
} from "@src/entities/type/interfaces";
import { useAtom } from "jotai";
import { orderDatasAtom } from "../lib/atom";
import { useState, useEffect } from "react";
import { useUserQuery } from "@src/shared/hooks/react-query/useUserQuery";
import {
    useGetUserCouponsListQuery,
    useOrderQuery,
    useUpdateUserCouponMutation,
} from "@src/shared/hooks/react-query/useBenefitQuery";
import { MileageItem, OrderData } from "@/src/entities/type/interfaces";
import { orderAccept } from "@/src/features/order/order";
import { redirect } from "next/navigation";
import { earnMileage, spendMileage } from "@/src/features/benefit/mileage";
import { updateUser } from "../lib/server/user";
import PortOne from "@portone/browser-sdk/v2";
import { WindowType } from "node_modules/@portone/browser-sdk/dist/v2/entity";

const useOrder = () => {
    const { session } = useUser();
    const router = useRouter();
    const { data: user, isLoading, refetch: UserDataRefetch } = useUserQuery();

    // ✅ IUserCouponPopulated 배열로 타입 지정
    const { data: coupons, isLoading: isCouponsLoading } =
        useGetUserCouponsListQuery("user");
    const { refetch: orderListRefetch } = useOrderQuery(user?._id);

    const updateCoupon = useUpdateUserCouponMutation();

    const [orderDatas, setOrderDatas] = useAtom<SelectedItem[] | []>(
        orderDatasAtom,
    );
    const [mileage, setMileage] = useState(0);
    const [usedMileage, setUsedMileage] = useState(0);
    const [useCoupon, setUseCoupon] = useState(0);
    const [applyCoupon, setApplyCoupon] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalMileage, setTotalMileage] = useState(0);
    const [deliveryMemo, setDeliveryMemo] = useState("");
    const [customMemo, setCustomMemo] = useState("");
    const [couponMemo, setCouponMemo] = useState("");
    const [appliedCouponName, setAppliedCouponName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [postcode, setPostcode] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const [saveAddress, setSaveAddress] = useState(false);
    const [payments, setPayments] = useState<"NAVER_PAY" | "KAKAO_PAY" | "CARD">("CARD");

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

    const returnStoreId = async (payments: string): Promise<string> => {
        switch (payments) {
            case "NAVER_PAY":
                return "store-f8bba69a-c4d7-4754-aeae-c483519aa061"; // 네이버 페이 테스트 채널 키
            case "KAKAO_PAY":
                return "channel-key-a2d29b8e-d463-4089-9f23-fefb2f08ca46"; // 카카오 페이 테스트 채널 키
            case "CARD":
                return "store-f8bba69a-c4d7-4754-aeae-c483519aa061"; // 카드 결제 테스트 채널 키
            default:
                return ""; // 기본 테스트 상점 ID
        }
    }

    const orderComplete = async () => {
        // 필수 값 검증
        if (!phoneNumber || !address || !postcode) {
            alert("배송 정보를 모두 입력해주세요.");
            return;
        }

        if (orderDatas.length === 0 || totalPrice <= 0) {
            alert("주문 정보를 확인해주세요.");
            return;
        }

        const orderData: OrderData = {
            userId: user._id,
            userNm: user.name,
            phoneNumber,
            address,
            detailAddress,
            postcode,
            deliveryMemo: customMemo || deliveryMemo,
            items: orderDatas.map((item) => ({
                productId: item.productId,
                productNm: item.title,
                quantity: item.quantity,
                color: item.color,
                size: item.size,
            })),
            payMethod: payments,
            shippingStatus: "pending",
            totalPrice,
        };

        const paymentId = crypto.randomUUID();
        const paymentRes = await PortOne.requestPayment({
            storeId: "store-f8bba69a-c4d7-4754-aeae-c483519aa061", // 테스트 상점 ID
            channelKey: await returnStoreId(payments), // 테스트 채널 키
            paymentId,
            orderName: orderDatas.length === 1
                ? orderDatas[0].title
                : `${orderDatas[0].title} 외 ${orderDatas.length - 1}건`,
            totalAmount: session?.user?.email?.startsWith("admin")
                ? 1
                : totalPrice,
            currency: "CURRENCY_KRW",
            payMethod: payments === "NAVER_PAY" || "KAKAO_PAY" ? "EASY_PAY" : "CARD",
            customData: {
                userId: user._id,
            },
            windowType: {
                "pc": "POPUP",
                "mobile": "REDIRECTION"
            }
        });

        console.log("결제 결과:", paymentRes);

        if (!paymentRes) {
            alert("결제 요청 실패");
            return;
        }

        if (paymentRes.code !== undefined) {
            switch (paymentRes.pgCode) {
                case "PAY_PROCESS_CANCELED":
                    alert("결제가 취소되었습니다.");
                    return;
                default:
                    alert("결제 실패: " + paymentRes.pgMessage);
                    return;
            }
        }

        const res = await orderAccept({
            ...orderData,
            paymentId,
        });

        if (res.success) {
            await Promise.all([
                couponMemo !== "" ? useSpendCoupon() : Promise.resolve(),
                useSpendMileage(res),
                addEarnMileage(res),
                saveNewAddress(),
            ]);

            alert(res.message);
            orderListRefetch();
            UserDataRefetch();
            redirect("/profile/order");
        } else {
            alert(res.message);
        }
    };

    // ✅ IUserCoupon 구조에 맞춘 쿠폰 사용 함수
    const useSpendCoupon = async (): Promise<void> => {
        const userCoupons = coupons?.data || [];

        if (userCoupons.length === 0) {
            alert("사용 가능한 쿠폰이 없습니다.");
            setCouponMemo("");
            return;
        }

        // IUserCouponPopulated 구조에서 쿠폰 찾기
        const validCoupons = userCoupons.filter(
            (uc): uc is UserCouponWithPopulate => {
                return (
                    uc.couponId &&
                    typeof uc.couponId !== "string" &&
                    uc.couponId.name === couponMemo
                );
            },
        );

        const selected = validCoupons[0];

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
