"use client";

import { useEffect, useState } from "react";
import ProfileNavbar from "@src/widgets/navbar/ProfileNav";
import { EditProfile, ProfileInfo, OrderList } from "@src/components/profile";
import CouponList from "@src/components/coupon/CouponList";
import MileageList from "@src/components/mileage/MileageList";

const ProfileClient = ({ id }: { id: string }) => {
    const [title, setTitle] = useState<string | "">("");
    const [child, setChild] = useState<React.ReactNode | null>(null);

    useEffect(() => {
        switch (id) {
            case "order":
                setTitle("Order List");
                setChild(<OrderList />);
                break;
            case "edit":
                setTitle("Edit Profile");
                setChild(<EditProfile />);
                break;
            case "mileage":
                setTitle("Mileage");
                setChild(<MileageList />);
                break;
            case "coupon":
                setTitle("Coupon");
                setChild(<CouponList />);
                break;
            default:
                setChild(<div className="flex">500 : 기능 개발중입니다</div>);
                break;
        }
    }, [id]);

    return (
        <div className="h-screen w-full">
            <div className="grid h-full w-full items-center justify-center sm:grid-cols-10">
                <ProfileNavbar id={id} />

                <div className="col-span-8 mt-32 flex h-full w-[80vw] flex-col items-start justify-center sm:mt-0 sm:w-[90%]">
                    <ProfileInfo />

                    <div className="mt-5 flex h-full w-full flex-col items-center justify-start gap-5 text-5xl sm:m-0 sm:items-stretch">
                        <span className="font-amstel-thin place-self-start text-[0.8em]">
                            {title}
                        </span>
                        <span className="w-full border-b border-gray-200" />
                        <div>{child}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileClient;
