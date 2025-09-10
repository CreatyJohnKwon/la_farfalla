"use client";

import ProfileNavbar from "@src/widgets/navbar/ProfileNav";
import EditProfile from "@src/components/profile/EditProfile";
import ProfileInfo from "@src/components/profile/ProfileInfo";
import CouponList from "@src/components/coupon/CouponList";
import MileageList from "@src/components/mileage/MileageList";
import OrderList from "@src/components/order/OrderList";
import { redirect } from "next/navigation";
import { useMemo } from "react";

const ProfileClient = ({ id }: { id: string }) => {
    const { title, children } = useMemo(() => {
        switch (id) {
            case "order":
                return { title: "Order List", children: <OrderList /> };
            case "edit":
                return { title: "Edit Profile", children: <EditProfile /> };
            case "mileage":
                return { title: "Mileage", children: <MileageList /> };
            case "coupon":
                return { title: "Coupon", children: <CouponList /> };
            default:
                redirect("/profile/order");
        }
    }, [id]);

    return (
        <div className="min-h-screen w-full">
            <div className="grid w-full items-start justify-center sm:grid-cols-10">
                <ProfileNavbar id={id} />

                <div className="col-span-8 mt-32 flex w-[85vw] flex-col items-start justify-center sm:mt-0 sm:w-[90%]">
                    <ProfileInfo />

                    <div className="mt-5 flex w-full flex-col items-center justify-start gap-5 text-5xl sm:m-0 sm:items-stretch">
                        <span className="font-amstel-thin w-full text-2xl sm:text-3xl">
                            {title}
                        </span>
                        <span className="h-0 w-full border-b border-gray-200 sm:w-full" />
                        
                        <div>{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileClient;