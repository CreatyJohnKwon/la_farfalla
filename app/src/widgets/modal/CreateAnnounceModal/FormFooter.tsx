import {
    CreateAnnounceData,
    IAnnounceDTO,
    UpdateAnnounceParams,
} from "@/src/entities/type/announce";
import { UseMutationResult } from "@tanstack/react-query";

interface MutationContext {
    previousAnnounces: IAnnounceDTO[] | undefined;
}

interface Props {
    isSubmitting: boolean;
    isSubmitDisabled: boolean;
    isEditMode: boolean;
    createAnnounceMutation: UseMutationResult<
        IAnnounceDTO,
        Error,
        CreateAnnounceData,
        unknown
    >;
    updateAnnounceMutation: UseMutationResult<
        IAnnounceDTO,
        Error,
        UpdateAnnounceParams,
        MutationContext
    >;
    cancelEditMode: () => void;
    handleSubmit: () => Promise<void>;
    onClose: () => void;
}

const FormFooter = ({
    isSubmitting,
    handleSubmit,
    isSubmitDisabled,
    createAnnounceMutation,
    updateAnnounceMutation,
    isEditMode,
    cancelEditMode,
    onClose,
}: Props) => (
    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex gap-3">
            <button
                onClick={handleSubmit}
                disabled={isSubmitDisabled}
                className="flex-1 bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isSubmitting ||
                createAnnounceMutation.isPending ||
                updateAnnounceMutation.isPending ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {isEditMode ? "수정 중..." : "저장 중..."}
                    </div>
                ) : isEditMode ? (
                    "공지 수정하기"
                ) : (
                    "공지 저장하기"
                )}
            </button>
            {isEditMode ? (
                <button
                    className="border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
                    onClick={cancelEditMode}
                >
                    수정 취소
                </button>
            ) : (
                <button
                    className="border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
                    onClick={onClose}
                >
                    취소
                </button>
            )}
        </div>
    </div>
);

export default FormFooter;
