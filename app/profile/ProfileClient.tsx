"use client";

import ProfileNavbar from "@/src/widgets/navbar/ProfileNav";
import EditProfile from "./EditProfile";
import usePage from "@/src/shared/hooks/usePage";
import ProfileInfo from "./ProfileInfo";
import Navbar from "@/src/widgets/navbar/Navbar";
import ShopDrop from "@/src/components/drop/ShopDrop";

const ProfileClient = () => {
    const { pages } = usePage();

    const handlePages = () => {
        switch (pages) {
            case "e":
                return <EditProfile />;
            case "o":
                return <div className="">주문조회</div>;
            // case "q":
            //     return (
            //         <div className="">
            //             1:1 문의
            //         </div>
            //     );
            default:
                return <div className="">500 : 서버 점검중입니다</div>;
        }
    };

    return (
        <div className="h-screen w-screen">
            <Navbar children={<ShopDrop />} />
            <div className="grid h-full w-full items-center justify-center sm:grid-cols-6">
                <ProfileNavbar />

                <div className="col-span-5 flex h-full w-full items-center justify-center">
                    <div className="grid h-full w-full grid-rows-5">
                        <div className="row-span-2">
                            <ProfileInfo />
                        </div>
                        <div className="font-brand-thin row-span-3 flex items-center justify-center text-5xl text-black">
                            {handlePages()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileClient;
