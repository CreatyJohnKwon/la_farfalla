// components/FormHeader.tsx
import React from "react";

interface FormHeaderProps {
    isEditMode: boolean;
}

export const FormHeader = React.memo(({ isEditMode }: FormHeaderProps) => (
    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">
            {isEditMode ? "공지 수정" : "새 공지 생성"}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
            {isEditMode
                ? "공지사항을 수정하여 업데이트하세요"
                : "공지사항을 작성하여 사용자에게 알려보세요"}
        </p>
    </div>
));

FormHeader.displayName = "FormHeader";
