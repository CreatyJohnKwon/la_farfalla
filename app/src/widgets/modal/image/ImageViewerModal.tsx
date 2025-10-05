import { X } from "lucide-react";
import Image from "next/image";
import ModalWrap from "../etc/ModalWrap";

const ImageViewerModal = ({
    imageUrl,
    onClose,
}: {
    imageUrl: string | null;
    onClose: () => void;
}) => {
    if (!imageUrl) {
        return null;
    }

    return (
        <ModalWrap
            onClose={onClose}
            containerClassName="bg-black bg-opacity-90"
            className="relative bg-transparent p-0 shadow-none"
        >
            <button
                onClick={onClose}
                className="absolute -top-12 right-0 text-white transition-colors duration-200 hover:text-gray-300"
                aria-label="이미지 닫기"
            >
                <X className="h-8 w-8" />
            </button>
            <Image
                src={imageUrl}
                width={1000}
                height={1000}
                alt="팝업 이미지 미리보기"
                className="h-auto max-h-[90vh] w-[90vw] max-w-4xl object-contain sm:max-h-[70vh] sm:w-[70vw]"
                priority
            />
        </ModalWrap>
    );
};

export default ImageViewerModal;