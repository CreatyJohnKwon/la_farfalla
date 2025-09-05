"use client";

import { useEffect } from "react";
import Image from "next/image";
import BackgroundImg from "../../public/images/bg_250905.jpg";
import AnnounceLayer from "@/src/components/announce/AnnounceLayer";
import { AnnouncesProps } from "@/src/entities/type/announce";

const HomeClient = ({ bannerAnnounce, popupAnnounces }: AnnouncesProps) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

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

export default HomeClient;