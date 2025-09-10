"use client";

import { useEffect, useState } from "react";

import AnnounceBannerContent from "./AnnounceBannerContent";
import { IAnnounceDTO } from "@src/entities/type/announce";
import AnnouncePopup from "./AnnouncePopup";

interface AnnounceLayerProps {
    bannerAnnounce: IAnnounceDTO | null; // 띠 공지는 딱 1개 또는 null
    popupAnnounces: IAnnounceDTO[]; // 팝업 공지는 여러 개 배열로
}

const AnnounceLayer = ({
    bannerAnnounce,
    popupAnnounces,
}: AnnounceLayerProps) => {
    const [bannerVisible, setBannerVisible] = useState(true);
    const [popupVisibleMap, setPopupVisibleMap] = useState<
        Record<string, boolean>
    >({});

    useEffect(() => {
        if (bannerAnnounce) {
            const key = `announce_hide_${bannerAnnounce._id}`;
            setBannerVisible(bannerAnnounce.visible);
        }

        if (popupAnnounces.length > 0) {
            const newMap: Record<string, boolean> = {};
            popupAnnounces.forEach(({ _id }) => {
                const key = `announce_hide_${_id}`;
                newMap[_id.toString()] = !localStorage.getItem(key);
            });
            setPopupVisibleMap(newMap);
        }
    }, [bannerAnnounce, popupAnnounces]);

    const handlePopupClose = (id: string) => {
        setPopupVisibleMap((prev) => ({ ...prev, [id]: false }));
    };

    const handlePopupNeverShowAgain = (id: string) => {
        localStorage.setItem(`announce_hide_${id}`, "true");
        handlePopupClose(id);
    };

    // 공지 둘 다 없으면 아무것도 안 띄움
    if (!bannerAnnounce && popupAnnounces.length === 0) return null;

    return (
        <>
            {/* 팝업 공지 */}
            <div className="fixed left-[2vw] top-[10vh] z-50 flex max-w-full space-x-4 overflow-x-auto">
                {popupAnnounces.map((announce, index) =>
                    popupVisibleMap[announce._id.toString()] ? (
                        <div key={`${announce._id.toString()}_${index}`}>
                            <AnnouncePopup
                                announce={announce}
                                onClose={() =>
                                    handlePopupClose(announce._id.toString())
                                }
                                onNeverShowAgain={() =>
                                    handlePopupNeverShowAgain(
                                        announce._id.toString(),
                                    )
                                }
                            />
                        </div>
                    ) : null,
                )}
            </div>

            {/* 띠 공지 (단일 객체) */}
            {bannerAnnounce && bannerVisible && (
                <AnnounceBannerContent announce={bannerAnnounce} />
            )}
        </>
    );
};

export default AnnounceLayer;
