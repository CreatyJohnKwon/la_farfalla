"use client";

import ProfileNavbar from "@/src/widgets/navbar/ProfileNav";
import EditProfile from "./EditProfile";
import usePage from "@/src/shared/hooks/usePage";
import ProfileInfo from "./ProfileInfo";
import OrderClient from "./OrderClient";
import { useEffect, useState, useRef } from "react";

const ProfileClient = () => {
    const { pages } = usePage();
    const [title, setTitle] = useState<string | "">("");
    const [child, setChild] = useState<React.ReactNode | null>(null);

    useEffect(() => {
        switch (pages) {
            case "o":
                setTitle("Order List");
                setChild(<OrderClient />);
                break;
            case "e":
                setTitle("Edit Profile");
                setChild(<EditProfile />);
                break;
            default:
                setChild(<div className="flex">500 : 서버 점검중입니다</div>);
                break;
        }
    }, [pages]);

    return (
        <div className="h-screen w-screen">
            <div className="grid h-full w-full items-center justify-center sm:grid-cols-10">
                <ProfileNavbar />

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
