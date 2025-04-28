"use client";

import ProfileNavbar from "@/src/widgets/navbar/ProfileNav";
import EditProfile from "./EditProfile";
import useProfile from "@/src/shared/hooks/useProfile";

const ProfileClient = () => {
    const { pages } = useProfile();

    const handlePages = () => {
        switch (pages) {
            case "e":
                return <EditProfile />;
            case "o":
                return (
                    <div className="font-brand-thin text-5xl text-black">
                        주문조회
                    </div>
                );
            case "q":
                return (
                    <div className="font-brand-thin text-5xl text-black">
                        1:1 문의
                    </div>
                );
            default:
                return (
                    <div className="font-brand-thin text-5xl text-black">
                        404 서버 점검중입니다
                    </div>
                );
        }
    };

    return (
        <div className="grid h-screen w-screen grid-cols-8 items-center justify-center">
            <ProfileNavbar />
            <div className="col-span-6 flex h-full w-full items-center justify-center">
                {handlePages()}
            </div>
        </div>
    );
};

export default ProfileClient;
