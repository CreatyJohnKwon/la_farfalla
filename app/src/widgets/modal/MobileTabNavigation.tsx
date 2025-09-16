// components/MobileTabNavigation.tsx
import React from "react";

interface MobileTabNavigationProps {
    activeTab: "create" | "list";
    setActiveTab: (tab: "create" | "list") => void;
    isEditMode: boolean;
    announceCount: number;
}

export const MobileTabNavigation = React.memo(
    ({
        activeTab,
        setActiveTab,
        isEditMode,
        announceCount,
    }: MobileTabNavigationProps) => (
        <div className="flex border-b border-gray-200 bg-gray-50">
            <button
                onClick={() => setActiveTab("create")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "create"
                        ? "border-b-2 border-blue-600 bg-white text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                }`}
            >
                <div className="flex items-center justify-center gap-2">
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
                            d={
                                isEditMode
                                    ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    : "M12 4v16m8-8H4"
                            }
                        />
                    </svg>
                    {isEditMode ? "공지 수정" : "새 공지 생성"}
                </div>
            </button>
            <button
                onClick={() => setActiveTab("list")}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === "list"
                        ? "border-b-2 border-blue-600 bg-white text-blue-600"
                        : "text-gray-500 hover:text-gray-700"
                }`}
            >
                <div className="flex items-center justify-center gap-2">
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
                            d="M4 6h16M4 10h16M4 14h16M4 18h16"
                        />
                    </svg>
                    공지 목록 ({announceCount})
                </div>
            </button>
        </div>
    ),
);

MobileTabNavigation.displayName = "MobileTabNavigation";
