"use client";

import ProfileNavbar from "@/src/widgets/navbar/ProfileNav";
import EditProfile from "./EditProfile";
import useProfile from "@/src/shared/hooks/useProfile";

const ProfileClient = () => {
    const { pages, setPages } = useProfile();

    const handlePages = () => {
        switch (pages) {
            case "e":
                return <EditProfile />;
            case "o":
                return <div className="text-black text-5xl font-brand-thin">주문내역</div>;
            case "q":
                return <div className="text-black text-5xl font-brand-thin">Q&A</div>;
            default:
                return <div className="text-black text-5xl font-brand-thin">404 서버 점검중입니다</div>;
        }
    };

    return (
        <div className="grid grid-cols-8 h-screen w-screen items-center justify-center">
            <ProfileNavbar />
            <div className="flex h-full w-full items-center justify-center col-span-6">
                {handlePages()}
            </div>
        </div>
    );
};

export default ProfileClient;
