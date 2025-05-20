"use client";

import ProfileNavbar from "@/src/widgets/navbar/ProfileNav";
import EditProfile from "@/src/components/profile/EditProfile";
import ProfileInfo from "@/src/components/profile/ProfileInfo";
import OrderClient from "@/src/components/profile/OrderClient";
import { useEffect, useState } from "react";

const ProfileClient = ({ id }: { id: string }) => {
    const [title, setTitle] = useState<string | "">("");
    const [child, setChild] = useState<React.ReactNode | null>(null);

    useEffect(() => {
        switch (id) {
            case "order":
                setTitle("Order List");
                setChild(<OrderClient />);
                break;
            case "edit":
                setTitle("Edit Profile");
                setChild(<EditProfile />);
                break;
            case "mileage":
                setTitle("Mileage");
                setChild(<div className="flex">마일리지 페이지</div>);
                break;
            case "coupon":
                setTitle("Coupon");
                setChild(<div className="flex">쿠폰 페이지</div>);
                break;
            default:
                setChild(<div className="flex">500 : 기능 개발중입니다</div>);
                break;
        }
    }, [id]);

    return (
        <div className="h-screen w-screen">
            <div className="grid h-full w-full items-center justify-center sm:grid-cols-10">
                <ProfileNavbar id={id} />

                <div className="col-span-8 flex h-full w-full flex-col items-center justify-center">
                    <ProfileInfo />

                    <div className="font-amstel flex h-full w-full flex-col justify-start gap-5 text-5xl">
                        <span className="w-full">{title}</span>
                        <span className="hidden w-[90%] border-b border-gray-200 c_md:block" />
                        <div>{child}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileClient;
