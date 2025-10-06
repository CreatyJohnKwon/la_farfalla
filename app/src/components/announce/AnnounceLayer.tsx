"use client";

import { useEffect, useState } from "react";

import AnnounceBannerContent from "./AnnounceBannerContent";
import { IAnnounceDTO } from "@src/entities/type/announce";
import AnnouncePopup from "./AnnouncePopup";

interface AnnounceLayerProps {
    bannerAnnounce: IAnnounceDTO | null;
    popupAnnounces: IAnnounceDTO[];
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

    if (!bannerAnnounce && popupAnnounces.length === 0) return null;

    return (
        <>
            {/* 팝업 공지 */}
            <div className="fixed top-[10vh] z-50 w-full grid place-items-center items-start pointer-events-none 
                           sm:w-auto sm:left-[2vw] sm:flex sm:justify-start sm:space-x-4">
                {popupAnnounces.map((announce, index) =>
                    popupVisibleMap[announce._id.toString()] ? (
                        <div
                            key={`${announce._id.toString()}_${index}`}
                            /*
                              [수정된 부분]
                              - sm:flex 를 추가하여 데스크톱에서 flex 컨테이너로 만듭니다.
                            */
                            className="col-start-1 row-start-1 pointer-events-auto sm:flex"
                        >
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