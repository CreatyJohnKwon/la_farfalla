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
    useUpdateUserCouponMutation,
} from "@src/shared/hooks/react-query/useBenefitQuery";
import { orderAccept } from "@src/features/order/order";
import { earnMileage, spendMileage } from "@src/features/benefit/mileage";
import { updateUser } from "../lib/server/user";
import * as PortOne from "@portone/browser-sdk/v2";
import * as Currency from "@portone/browser-sdk/v2";
import { sendMail } from "../lib/server/order";
import {
    useOrderQuery,
    useUpdateStockMutation,
} from "./react-query/useOrderQuery";
import { ProductOption } from "@src/components/product/interface";
import { v4 as uuidv4 } from "uuid";
import { adminEmails } from "public/data/common";
import { MileageItem, OrderData } from "@src/components/order/interface";

const useOrder = () => {
    const { session } = useUser();
    const router = useRouter();
    const { data: user, isLoading, refetch: UserDataRefetch } = useUserQuery();

    // ✅ IUserCouponPopulated 배열로 타입 지정
    const { data: coupons, isLoading: isCouponsLoading } =
        useGetUserCouponsListQuery(true);
    const { refetch: orderListRefetch } = useOrderQuery(user?._id);

    const updateCoupon = useUpdateUserCouponMutation();
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
    const [appliedCouponName, setAppliedCouponName] = useState("");
    const [recipientName, setRecipientName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");
    const [postcode, setPostcode] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const [saveAddress, setSaveAddress] = useState(false);
    const [payments, setPayments] = useState<
        "NAVER_PAY" | "KAKAO_PAY" | "CARD"
    >("NAVER_PAY");

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

    const processSuccessfulPayment = async (response: any, orderData: OrderData, stockItems: ProductOption[]) => {
        try {
            const updatedOrderData = {
                ...orderData,
                paymentId: response.paymentId,
            };

            const res = await orderAccept(updatedOrderData);

            if (res.success) {
                await Promise.all([
                    couponMemo !== "" ? useSpendCoupon() : Promise.resolve(),
                    useSpendMileage(res),
                    saveNewAddress(),
                ]);

                const body = JSON.stringify({
                    ...updatedOrderData,
                    _id: res.orderId,
                    createdAt: new Date().toISOString(),
                });

                sendMail(body);
                alert(res.message);
                orderListRefetch();
                UserDataRefetch();
                router.replace("/profile/order");
            } else {
                console.error("error", res);
                alert(res.message);
                // 주문 처리 실패 시 재고 복구
                await updateStockMutation.mutateAsync({
                    items: stockItems,
                    action: "restore",
                });
            }
        } catch (error) {
            console.error("결제 후 처리 중 오류:", error);
            alert("결제는 성공했으나 주문 처리 중 오류가 발생했습니다. 관리자에게 문의해주세요.");
            // 에러 발생 시 재고 복구
            await updateStockMutation.mutateAsync({
                items: stockItems,
                action: "restore",
            });
        }
    };

    const orderComplete = async () => {
        // 로딩 시작
        setIsSubmitting(true);

        let stockItems: ProductOption[] = [];

        // 필수 값 검증
        if (!phoneNumber || !address || !postcode) {
            alert("배송 정보를 모두 입력해주세요.");
            return;
        }

        if (orderDatas.length === 0 || totalPrice <= 0) {
            alert("주문 정보를 확인해주세요.");
            return;
        }

        let orderData: OrderData = {
            userId: user._id,
            userNm: recipientName,
            phoneNumber: phoneNumber,
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
                image: [],
            })),
            payMethod: payments,
            shippingStatus: "pending",
            totalPrice,
        };

        const storeId = "store-f8bba69a-c4d7-4754-aeae-c483519aa061";
        const channelKey = "channel-key-4d42f07d-23eb-4594-96a6-2cd6a583e8b4";

        if (!channelKey) {
            alert("결제 채널이 설정되지 않았습니다.");
            return;
        }

        try {
            stockItems = orderDatas.map((item) => ({
                productId: item.productId,
                colorName: item.color,
                stockQuantity: item.quantity,
            }));

            await updateStockMutation.mutateAsync({
                items: stockItems,
                action: "reduce",
            });

            const isMobile = /Mobi/i.test(window.navigator.userAgent);
            const paymentParams: any = {
                storeId,
                channelKey,
                paymentId: uuidv4(),
                orderName:
                    orderDatas.length === 1
                        ? orderDatas[0].title
                        : `${orderDatas[0].title} 외 ${orderDatas.length - 1}건`,
                totalAmount: adminEmails.includes(session?.user?.email || "")
                    ? 1000
                    : totalPrice,
                currency: "CURRENCY_KRW",
                payMethod: "CARD",
                customer: {
                    fullName: user.name,
                    phoneNumber: user.phoneNumber,
                    email: user.email
                },
            };

            if (!isMobile) {
                const response = await PortOne.requestPayment(paymentParams);
                
                // 응답이 없거나 에러 코드가 있는 경우 처리
                if (!response || response.code !== undefined) {
                    await updateStockMutation.mutateAsync({
                        items: stockItems,
                        action: "restore",
                    });

                    alert(response?.message || response?.pgMessage);
                    setIsSubmitting(false);
                    return;
                }

                // ✅ 분리한 함수를 직접 호출
                await processSuccessfulPayment(response, orderData, stockItems);
            } else {
                // 📱 모바일 환경 로직
                await PortOne.requestPayment({
                    ...paymentParams,
                    redirectUrl: `${window.location.origin}/payment/callback?stockItems=${JSON.stringify(stockItems)}`,
                });
            }
        } catch (error) {
            console.error("결제 처리 중 오류:", error);
            alert(
                `결제 처리 중 오류가 발생했습니다.\n다시 시도해주세요.\n${error}`,
            );

            // 오류 발생 시 재고 복구 (필요한 경우)
            if (stockItems.length > 0) {
                await updateStockMutation.mutateAsync({
                    items: stockItems,
                    action: "restore",
                }).catch(restoreError => console.error("재고 복구 중 오류 발생:", restoreError));
            }
        } finally {
            setIsSubmitting(false); // 로딩 종료 (성공, 실패, 에러 모두)
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

        orderComplete,
        isSubmitting,
        processSuccessfulPayment
    };
};

export default useOrder;
