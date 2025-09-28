"use client";

import { useEffect } from "react";
import Image from "next/image";
import BackgroundImg from "../../public/images/bg_new_250911.jpeg";
import AnnounceLayer from "@src/components/announce/AnnounceLayer";
import { IAnnounceDTO } from "@src/entities/type/announce";

interface AnnouncesProps {
  bannerAnnounce: IAnnounceDTO | null;
  popupAnnounces: IAnnounceDTO[];
}

const HomeClient = ({ bannerAnnounce, popupAnnounces }: AnnouncesProps) => {
  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "auto";
    };
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col text-white overflow-auto scrollbar-hide">
      {/* ✅ 배경 이미지 */}
      <div className="absolute inset-0 -z-10">
        <Image
          src={BackgroundImg}
          alt="background"
          height={1000}
          width={1000}
          className="h-full w-full object-cover object-[70%_center] sm:object-top"
          priority
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