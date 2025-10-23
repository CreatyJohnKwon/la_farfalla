import { X } from "lucide-react";
import ModalWrap from "../etc/ModalWrap";

const AgreementModal = ({ 
    onClose,
    children
}: {
    onClose: () => void;
    children: React.ReactNode;
}) => { 
    return (
        <ModalWrap
            onClose={onClose}
            className="relative h-auto w-[90vw] overflow-hidden bg-white p-4 text-center shadow-xl md:w-1/3"
        >
            {/* 닫기 버튼 */}
            <button
                onClick={onClose}
                className="absolute right-4 top-4 text-zinc-400 transition hover:text-zinc-800"
                aria-label="닫기"
            >
                <X className="h-5 w-5" />
            </button>

            <div className="h-full overflow-y-auto">
                {children}
            </div>
        </ModalWrap>
    )
}

export default AgreementModal;