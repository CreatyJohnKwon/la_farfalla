import { X } from "lucide-react";
import Image from "next/image";

// 이미지 모달 컴포넌트
const ImageViewerModal = ({
    imageUrl,
    onClose,
}: {
    imageUrl: string | null;
    onClose: () => void;
}) =>
    imageUrl && (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4"
            onClick={onClose}
        >
            <div className="relative max-h-full max-w-4xl">
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
                    className="w-[90vw] sm:w-[70vw] h-auto object-contain max-h-[90vh] sm:max-h-[70vh] aspect-square"
                    onClick={(e) => e.stopPropagation()}
                    priority
                />
            </div>
        </div>
    );

export default ImageViewerModal;
