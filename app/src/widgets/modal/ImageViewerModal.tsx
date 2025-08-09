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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
            onClick={onClose}
        >
            <div className="relative max-h-[90vh] max-w-[90vw]">
                <button
                    onClick={onClose}
                    className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center bg-white text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="이미지 닫기"
                >
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                <Image
                    src={imageUrl}
                    width={1000}
                    height={1000}
                    alt="팝업 이미지 미리보기"
                    className="max-h-[80vh] w-auto object-contain"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );

export default ImageViewerModal;
