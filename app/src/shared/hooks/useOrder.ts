import { useRouter } from "next/navigation";
import useUser from "@src/shared/hooks/useUsers";
import {
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
import { earnMileage, spendMileage } from "@src/features/benefit/mileage";
import { updateUser } from "../lib/server/user";
import * as PortOne from "@portone/browser-sdk/v2";
import {
    useOrderQuery,
    useUpdateStockMutation,
} from "./react-query/useOrderQuery";
import { ProductOption } from "@src/components/product/interface";
import { MileageItem } from "@src/components/order/interface";
import { refundPayment } from "../lib/server/order";

const useOrder = () => {
    const { session } = useUser();
    const router = useRouter();
    const { data: user, isLoading, refetch: UserDataRefetch } = useUserQuery();

    // ✅ IUserCouponPopulated 배열로 타입 지정
    const { data: coupons, isLoading: isCouponsLoading } =
        useGetUserCouponsListQuery(true);
    const { refetch: orderListRefetch } = useOrderQuery(user?._id);

    const updateStockMutation = useUpdateStockMutation();

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
    const [couponId, setCouponId] = useState("");
    const [appliedCouponName, setAppliedCouponName] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [postcode, setPostcode] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const [saveAddress, setSaveAddress] = useState(false);
    const [payments, setPayments] = useState<
        "NAVER_PAY" | "KAKAO_PAY" | "CARD"
    >("CARD");

    // 주문 완료 상태 관리 (주문 로딩 스피너)
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setRecipientName(user.name);
    }, [user]);

    useEffect(() => {
        if (!user) return;
        setMileage(user.mileage - usedMileage);
    }, [usedMileage]);

    // SRP (Single-Responsibility-Principle)
    // 결제 요청 전까지의 모든 과정을 책임 진다.
    const handleOrderRequest = async () => {
        // 로딩 시작
        setIsSubmitting(true);
        saveNewAddress();

        // 필수 값 검증
        if (!phoneNumber || !address || !postcode) {
            alert("배송 정보를 모두 입력해주세요.");
            setIsSubmitting(false);
            return;
        }

        if (orderDatas.length === 0 || totalPrice <= 0) {
            alert("주문 정보를 확인해주세요.");
            setIsSubmitting(false);
            return;
        }

        // 1. 가격 계산에 필요한 최소 정보
        const calculationData = {
            items: orderDatas.map((item: any) => ({
                productId: item.productId,
                productNm: item.title,
                quantity: parseInt(item.quantity as any, 10) || 1,
                color: item.color,
                size: item.size
            })),
            usedMileage: usedMileage,
            couponId: couponId, // 사용할 쿠폰의 이름 또는 ID
        };

        // 2. DB에 저장될 배송지 등 기본 주문 정보
        let baseOrderData = {
            userId: user._id,
            userNm: recipientName,
            phoneNumber,
            address,
            detailAddress,
            postcode,
            deliveryMemo: customMemo || deliveryMemo,
            payMethod: payments,
        };

        try {
            const response = await fetch('/api/order/prepare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ calculationData, baseOrderData }),
            });

            const prepareData = await response.json();
            if (!response.ok || !prepareData.success) {
                throw new Error(prepareData.message || '주문을 준비하는 중 오류가 발생했습니다.');
            }

            const paymentParams: any = {
                storeId: "store-f8bba69a-c4d7-4754-aeae-c483519aa061",
                channelKey: "channel-key-4d42f07d-23eb-4594-96a6-2cd6a583e8b4",
                paymentId: prepareData.paymentId,
                orderName: prepareData.orderName,
                totalAmount: prepareData.totalAmount,
                currency: "CURRENCY_KRW",
                payMethod: "CARD",
                customer: {
                    fullName: user.name,
                    phoneNumber: user.phoneNumber,
                    email: user.email
                },
            };

            const isMobile = /Mobi/i.test(window.navigator.userAgent);
            if (isMobile) {
                // 모바일 결제
                await PortOne.requestPayment({
                    ...paymentParams,
                    redirectUrl: `${window.location.origin}/payment/callback?orderId=${prepareData.orderId}`,
                });
            } else {
                const portoneResponse = await PortOne.requestPayment(paymentParams);
                if (!portoneResponse) throw new Error("결제 도중 에러가 발생했습니다");

                switch (portoneResponse.code) {
                    case null:
                    case undefined:
                        if (portoneResponse) await handlePaymentCompletion(portoneResponse, prepareData.orderId, calculationData.items);
                        break;

                    case "FAILURE_TYPE_PG":
                    case "PG_PROVIDER_ERROR":
                    default:
                        if (portoneResponse?.pgMessage) alert(`${portoneResponse?.pgMessage}\nQ&A 채널로 문의해주세요.`)
                        else alert(`결제 요청 처리 중 오류가 발생했습니다.\nQ&A 채널로 문의해주세요.`)
                        await restoreItems(calculationData.items);
                        break;
                }
            }
        } catch (error: any) {
            console.error("결제 요청 처리 중 오류:", error);
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 결제 성공 후의 책임
    const handlePaymentCompletion = async (portoneResponse: PortOne.PaymentResponse, orderId: string, restoreItems: any) => {
        try {
            const response = await fetch('/api/order/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: orderId,
                    paymentId: portoneResponse.paymentId,
                    couponId: couponId,
                    isSuccess: true,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "주문 완료 처리 중 서버에서 오류가 발생했습니다.");
            }

            alert(result.message || "주문이 성공적으로 완료되었습니다.");

            orderListRefetch();
            UserDataRefetch();

            router.replace("/profile/order");
        } catch (error: any) {
            console.error("결제 후처리 중 오류:", error);
            const refundData = {
                paymentId: portoneResponse.paymentId,
                reason: error.message || "[어드민] 결제 성공이지만 주문 에러 발생"
            }
            await refundPayment(refundData);
            await restoreItems(restoreItems)
            alert(
                `결제는 성공했으나 주문을 확정하는 데 실패했습니다.\n문제가 지속되면 관리자에게 문의해주세요.\n(오류: ${error.message})`
            );
        }
    };

    const useSpendMileage = async (res: any, description?: string, mileage?: number, orderId?: string) => {
        const useSpendMileage: MileageItem = {
            userId: user?._id,
            type: "spend",
            amount: mileage || usedMileage,
            description: description || "마일리지 사용",
            relatedOrderId: orderId || res.orderId,
            createdAt: new Date().toISOString(),
        };
        spendMileage(useSpendMileage);
    };

    const addEarnMileage = async (orderId: string, description?: string, mileage?: number) => {
        const addMileage: MileageItem = {
            userId: user?._id,
            type: "earn",
            amount: mileage || totalMileage,
            description: description || "마일리지 적립",
            relatedOrderId: orderId,
            createdAt: new Date().toISOString(),
        };
        await earnMileage(addMileage);
    };

    const saveNewAddress = async () => {
        if (saveAddress === false) return;

        const updateAddress = {
            email: user.email,
            address,
            detailAddress,
            postcode,
        };

        await updateUser(updateAddress);
    };

    const restoreItems = async (stockItems: Array<any>) => {
        if (!stockItems || stockItems.length === 0) {
            console.error("복원할 아이템 정보가 없습니다.");
            return;
        }

        const itemsToRestore: ProductOption[] = stockItems.map(item => ({
                productId: item.productId,
                colorName: item.color,
                stockQuantity: item.quantity,
            }));

        await updateStockMutation.mutateAsync({
            items: itemsToRestore,
            action: "restore",
        }).catch(restoreError => console.error("재고 복구 중 오류 발생:", restoreError));
    }

    return {
        user,
        isLoading,
        coupons, // ✅ IUserCouponPopulated 배열 반환
        isCouponsLoading,
        addEarnMileage,
        useSpendMileage,

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
        couponId,
        setCouponId,
        appliedCouponName,
        setAppliedCouponName,
        useCoupon,
        setUseCoupon,
        applyCoupon,
        setApplyCoupon,
        totalPrice,
        setTotalPrice,
        totalMileage,
        setTotalMileage,

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
        saveAddress,
        setSaveAddress,
        setPayments,

        handleOrderRequest,
        isSubmitting,
        handlePaymentCompletion,
        restoreItems
    };
};

export default useOrder;
