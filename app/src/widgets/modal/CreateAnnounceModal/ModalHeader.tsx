// components/ModalHeader.tsx
import React from "react";

interface ModalHeaderProps {
    isEditMode: boolean;
    cancelEditMode: () => void;
    onClose: () => void;
}

export const ModalHeader = React.memo(
    ({ isEditMode, cancelEditMode, onClose }: ModalHeaderProps) => (
        <div className="border-b border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                    공지사항 관리
                </h2>
                <button
                    onClick={() => {
                        if (isEditMode) {
                            cancelEditMode();
                        } else {
                            onClose();
                        }
                    }}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <span className="sr-only">닫기</span>
                    <svg
                        className="h-6 w-6"
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
            </div>
        </div>
    ),
);

ModalHeader.displayName = "ModalHeader";
