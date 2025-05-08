"use client";

import ProfileNavbar from "@/src/widgets/navbar/ProfileNav";
import EditProfile from "./EditProfile";
import usePage from "@/src/shared/hooks/usePage";
import ProfileInfo from "./ProfileInfo";
import OrderClient from "./OrderClient";

const ProfileClient = () => {
    const { pages } = usePage();

    const handlePages = () => {
        switch (pages) {
            case "e":
                return <EditProfile />;
            case "o":
                return <OrderClient />;
            default:
                return <div className="flex">500 : 서버 점검중입니다</div>;
        }
    };

    return (
        <div className="h-screen w-screen">
            <div className="grid h-full w-full items-center justify-center sm:grid-cols-8">
                <ProfileNavbar />

                <div className="col-span-6 flex h-full w-full flex-col items-center justify-center">
                    <ProfileInfo />

                    <div className="font-amstel h-full w-full items-center justify-center text-5xl">
                        {handlePages()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileClient;
