import { X } from "lucide-react";

const AgreementModal = ({ 
    onClose,
    children
}: {
    onClose: () => void;
    children: React.ReactNode;
}) => { 
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => onClose()}
        >
            <div
                className="relative h-[60vh] w-[90vw] overflow-hidden bg-white p-4 text-center shadow-xl md:w-1/3"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 닫기 버튼 */}
                <button
                    onClick={() => onClose()}
                    className="absolute right-4 top-4 text-zinc-400 transition hover:text-zinc-800"
                    aria-label="닫기"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="h-full overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default AgreementModal;