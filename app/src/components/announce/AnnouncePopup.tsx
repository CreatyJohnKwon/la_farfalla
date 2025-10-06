import { IAnnounceDTO } from "@src/entities/type/announce";
import Image from "next/image";
import { useState } from "react";
import ImgData from "../../../../public/images/chill.png";

interface AnnouncePopupContentProps {
    announce: IAnnounceDTO;
    onClose: () => void;
    onNeverShowAgain: () => void;
}

const AnnouncePopup = ({
    announce,
    onClose,
    onNeverShowAgain,
}: AnnouncePopupContentProps) => {
    const [neverShow, setNeverShow] = useState(false);

    const handleNeverShowAgain = () => {
        setNeverShow(true);
        onNeverShowAgain();
        onClose();
    };

    return (
        announce.visible && (
            <div className="relative w-[90%] sm:w-72 min-w-[30vw] place-self-center overflow-hidden bg-white">
                {/* 공지 이미지 */}
                <div className="relative w-full">
                    <Image
                        src={announce.description || ImgData}
                        width={500}
                        height={500}
                        alt="공지사항 이미지"
                        className="h-auto w-full"
                        sizes="120vw"
                        priority
                    />
                </div>

                {/* 버튼 영역 */}
                <div className="flex w-full items-center justify-between border-t border-gray-200 bg-gray-50 px-3 py-2 text-xs">
                    <button
                        onClick={handleNeverShowAgain}
                        className="flex items-center gap-1 text-gray-500 transition hover:text-gray-800"
                    >
                        오늘 하루 보지 않기
                    </button>
                    <button
                        onClick={onClose}
                        className="font-medium text-gray-700 transition hover:text-black"
                    >
                        닫기
                    </button>
                </div>
            </div>
        )
    );
};

export default AnnouncePopup;
