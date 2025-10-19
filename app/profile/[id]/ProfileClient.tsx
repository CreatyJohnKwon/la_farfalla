"use client";

import ProfileNavbar from "@src/widgets/navbar/ProfileNav";
import EditProfile from "@src/components/profile/EditProfile";
import ProfileInfo from "@src/components/profile/ProfileInfo";
import CouponList from "@src/components/coupon/CouponList";
import MileageList from "@src/components/mileage/MileageList";
import OrderList from "@src/components/order/OrderList";
import { redirect } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ApplyCouponCodeButton from "@src/widgets/button/ApplyCouponCodeButton";

const ProfileClient = ({ id }: { id: string }) => {
    const [showScrollTopButton, setShowScrollTopButton] = useState<boolean>(false);

    useEffect(() => {
        const handleScroll = () => {
            const { scrollHeight, clientHeight } = document.documentElement;

            const isHeightSufficient = scrollHeight >= clientHeight * 2;

            const scrollThreshold = (scrollHeight - clientHeight) * 0.5;
            const isScrolledEnough = window.scrollY > scrollThreshold;

            if (isHeightSufficient && isScrolledEnough) {
                setShowScrollTopButton(true);
            } else {
                setShowScrollTopButton(false);
            }
        };

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const { title, children } = useMemo(() => {
        switch (id) {
            case "order":
                return { title: "ORDER LIST", children: <OrderList /> };
            case "edit":
                return { title: "EDIT PROFILE", children: <EditProfile /> };
            case "mileage":
                return { title: "MILEAGE LIST", children: <MileageList /> };
            case "coupon":
                return { title: "COUPON LIST", children: <CouponList /> };
            default:
                redirect("/profile/order");
        }
    }, [id]);

    return (
        <div className="min-h-screen w-full">
            <div className="grid w-full items-start justify-center sm:grid-cols-10">
                <ProfileNavbar id={id} />

                <div className="col-span-8 mt-32 flex w-[90vw] flex-col items-start justify-center sm:mt-0 sm:w-[90%]">
                    <ProfileInfo />

                    <div className="mt-5 flex w-full flex-col items-start justify-start gap-4 text-5xl sm:m-0 sm:items-stretch">
                        {/* 쿠폰 등록 버튼 추가 */}
                        {id === "coupon" 
                            ? <ApplyCouponCodeButton title={title} />
                            : id === "edit" ?
                                <div className="flex flex-col gap-2">
                                    <p className="font-amstel-thin w-full text-2xl sm:text-3xl text-start">{title}</p>
                                    <p className="font-pretendard font-[100] w-full text-xs sm:text-sm text-start text-gray-500">* 주소찾기를 통해 주소 수정이 가능합니다.</p>
                                </div>
                                : <span className="font-amstel-thin w-full text-2xl sm:text-3xl text-start">{title}</span>}
                        <span className="h-0 w-full border-b border-gray-200" />
                        {children}
                    </div>
                </div>
            </div>

            <button
                onClick={scrollToTop}
                aria-label="맨 위로 스크롤"
                className={`fixed bottom-20 focus:bottom-24 right-7 z-50 md:p-3 md:mb-4 text-gray-500 hover:text-gray-600 transition-all duration-300 ${
                    showScrollTopButton ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 15.75l7.5-7.5 7.5 7.5"
                    />
                </svg>
            </button>
        </div>
    );
};

export default ProfileClient;