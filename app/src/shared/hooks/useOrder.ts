import { useRouter } from "next/navigation";
import useUser from "@src/shared/hooks/useUsers";
import { SelectedItem } from "@src/entities/type/interfaces";
import { useAtom } from "jotai";
import { orderDatasAtom } from "../lib/atom";
import { useState } from "react";
import { useUserQuery } from "@src/shared/hooks/react-query/useUserQuery";
import {
    useCouponsQuery,
    useSpendCouponMutation,
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
    const { data: coupons, isLoading: isCouponsLoading } = useCouponsQuery(
        user?._id,
    );
    const updateCoupon = useSpendCouponMutation();

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

        console.log(orderData);

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

    const useSpendCoupon = () => {
        if (coupons) {
            const selected = coupons.find((c) => c.name === couponMemo);

            if (selected && !selected.isUsed) {
                updateCoupon.mutate(selected._id, {
                    onError: () =>
                        alert(
                            "쿠폰 정보 저장에 오류가 발생했습니다\n채널톡에 문의해주세요",
                        ),
                });
            }

            setCouponMemo("");
        }
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
        coupons,
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
