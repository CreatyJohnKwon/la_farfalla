"use client";

import { useEffect } from "react";
import Image from "next/image";
import BackgroundImg from "../../public/images/background_img.jpeg";
import AnnounceLayer from "@/src/components/announce/AnnounceLayer";
import { IAnnounceDTO } from "@/src/entities/type/announce";
import { useAnnouncesQuery } from "@/src/shared/hooks/react-query/useAnnounce";

const Home = () => {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const { data: announces = [], isLoading: isListLoading } =
        useAnnouncesQuery();

    if (isListLoading) return null;

    // 타입 안전하게 필터
    const popupAnnounces: IAnnounceDTO[] = announces.filter(
        (announce) => announce.isPopup,
    );
    const bannerAnnounces: IAnnounceDTO[] = announces.filter(
        (announce) => !announce.isPopup,
    );

    // 배너는 단 하나
    const bannerAnnounce: IAnnounceDTO | null =
        bannerAnnounces.length > 0 ? bannerAnnounces[0] : null;

    return (
        <div className="relative flex min-h-screen w-full flex-col text-white">
            {/* ✅ 배경 이미지 */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src={BackgroundImg}
                    alt="background"
                    height={1080}
                    width={1920}
                    className="h-full w-full object-cover object-[70%_center] sm:object-left"
                />
            </div>

            {/* ✅ 공지 레이어 */}
            <AnnounceLayer
                bannerAnnounce={bannerAnnounce}
                popupAnnounces={popupAnnounces}
            />
        </div>
    );
};

export default Home;
