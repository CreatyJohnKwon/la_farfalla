"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Modal from "../Modal";
import {
    useCreateAnnounceMutation,
    useAnnouncesQuery,
    useUpdateAnnounceMutation,
} from "@/src/shared/hooks/react-query/useAnnounce";
import {
    AnnounceForm,
    IAnnounceDTO,
    MAX_DESCRIPTION_LENGTH,
    MAX_FILE_SIZE,
    ACCEPTED_IMAGE_TYPES,
    CreateAnnounceData,
} from "@/src/entities/type/announce";
import { deleteAnnounce } from "@/src/shared/lib/server/announce";
import { uploadImagesToServer } from "@/src/shared/lib/uploadToR2";
import {
    getCurrentDateTime,
    getDateTimeAfterHours,
    isImageUrl,
} from "@/src/utils/dataUtils";

// 합성 컴포넌트들
import { ModalHeader } from "./ModalHeader";
import { FormHeader } from "./FormHeader";
import { MobileTabNavigation } from "./MobileTabNavigation";
import FormContent from "./FormContent";
import FormFooter from "./FormFooter";
import ListContent from "./ListContent";

interface Props {
    onClose: () => void;
}

export default function CreateAnnounceModal({ onClose }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<"create" | "list">("create");

    // 수정 모드 상태
    const [editingAnnounce, setEditingAnnounce] = useState<IAnnounceDTO | null>(
        null,
    );
    const [isEditMode, setIsEditMode] = useState(false);

    // 폼 상태
    const [form, setForm] = useState<AnnounceForm>(() => ({
        isPopup: false,
        description: "",
        startAt: getCurrentDateTime(),
        deletedAt: getDateTimeAfterHours(1),
    }));

    const [errors, setErrors] = useState<
        Partial<Record<keyof AnnounceForm, string>>
    >({});
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // React Query 훅들
    const {
        data: announces,
        isLoading: isListLoading,
        error: listError,
    } = useAnnouncesQuery();

    const createAnnounceMutation = useCreateAnnounceMutation();
    const updateAnnounceMutation = useUpdateAnnounceMutation();

    // 유틸리티 함수들
    const cleanupImageUrl = useCallback((url: string) => {
        if (url && url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
        }
    }, []);

    // 수정할 공지사항 데이터를 폼에 적용하는 함수
    const populateFormWithAnnounce = useCallback((announce: IAnnounceDTO) => {
        const startDate = new Date(announce.startAt);
        const endDate = new Date(announce.deletedAt);

        // 로컬 datetime-local 형식으로 변환
        const formatDateForInput = (date: Date) => {
            if (isNaN(date.getTime())) {
                return getCurrentDateTime();
            }
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            const hours = String(date.getHours()).padStart(2, "0");
            const minutes = String(date.getMinutes()).padStart(2, "0");
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        const newForm: AnnounceForm = {
            isPopup: announce.isPopup,
            description:
                announce.isPopup && isImageUrl(announce.description)
                    ? ""
                    : announce.description || "",
            startAt: formatDateForInput(startDate),
            deletedAt: formatDateForInput(endDate),
        };

        setForm(newForm);
        setEditingAnnounce(announce);
        setIsEditMode(true);

        // 팝업 타입이고 이미지 URL인 경우 미리보기 설정
        if (announce.isPopup && isImageUrl(announce.description)) {
            setImagePreviewUrl(announce.description);
        } else {
            setImagePreviewUrl("");
        }

        setErrors({});
        setActiveTab("create");
    }, []);

    // 수정 모드 취소
    const cancelEditMode = useCallback(() => {
        setIsEditMode(false);
        setEditingAnnounce(null);

        setForm({
            isPopup: false,
            description: "",
            startAt: getCurrentDateTime(),
            deletedAt: getDateTimeAfterHours(1),
        });

        if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
            cleanupImageUrl(imagePreviewUrl);
        }
        setImagePreviewUrl("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setErrors({});
    }, [imagePreviewUrl, cleanupImageUrl]);

    // 폼 유효성 검사
    const validateForm = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof AnnounceForm, string>> = {};

        if (form.isPopup) {
            if (!form.imageFile && (!isEditMode || !imagePreviewUrl)) {
                newErrors.description = "이미지를 업로드해주세요";
            }
        } else {
            const trimmedDescription = form.description.trim();
            if (!trimmedDescription) {
                newErrors.description = "공지 내용을 입력해주세요";
            } else if (trimmedDescription.length > MAX_DESCRIPTION_LENGTH) {
                newErrors.description = `공지 내용은 최대 ${MAX_DESCRIPTION_LENGTH}자까지 입력 가능합니다`;
            }
        }

        const startDate = new Date(form.startAt);
        const endDate = new Date(form.deletedAt);

        if (isNaN(startDate.getTime())) {
            newErrors.startAt = "올바른 시작일시를 입력해주세요";
        }

        if (isNaN(endDate.getTime())) {
            newErrors.deletedAt = "올바른 종료일시를 입력해주세요";
        } else if (startDate >= endDate) {
            newErrors.deletedAt = "종료일시는 시작일시보다 늦어야 합니다";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [form, isEditMode, imagePreviewUrl]);

    // 입력 변경 핸들러
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const target = e.target;
            const { name, value, type } = target;

            setForm((prev) => ({
                ...prev,
                [name]:
                    type === "checkbox" && "checked" in target
                        ? (target as HTMLInputElement).checked
                        : value,
            }));

            // 에러 제거
            setErrors((prev) => {
                if (!prev[name as keyof AnnounceForm]) return prev;
                const newErrors = { ...prev };
                delete newErrors[name as keyof AnnounceForm];
                return newErrors;
            });
        },
        [],
    );

    // 이미지 파일 유효성 검사
    const validateImageFile = useCallback((file: File): string | null => {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type as any)) {
            return "JPG, PNG, GIF 파일만 업로드 가능합니다";
        }
        if (file.size > MAX_FILE_SIZE) {
            return "파일 크기는 5MB 이하여야 합니다";
        }
        return null;
    }, []);

    // 이미지 변경 핸들러
    const handleImageChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file) return;

            const validationError = validateImageFile(file);
            if (validationError) {
                setErrors((prev) => ({
                    ...prev,
                    description: validationError,
                }));
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
                return;
            }

            if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
                cleanupImageUrl(imagePreviewUrl);
            }

            const imageUrl = URL.createObjectURL(file);
            setForm((prev) => ({
                ...prev,
                description: file.name,
                imageFile: file,
            }));
            setImagePreviewUrl(imageUrl);

            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.description;
                return newErrors;
            });
        },
        [validateImageFile, imagePreviewUrl, cleanupImageUrl],
    );

    // 이미지 제거 핸들러
    const handleImageRemove = useCallback(() => {
        if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
            cleanupImageUrl(imagePreviewUrl);
        }

        setForm((prev) => ({
            ...prev,
            description: "",
            imageFile: undefined,
        }));
        setImagePreviewUrl("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [imagePreviewUrl, cleanupImageUrl]);

    // 스타일 변경 핸들러
    const handleStyleChange = useCallback(
        (isPopup: boolean) => {
            if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
                cleanupImageUrl(imagePreviewUrl);
            }

            setForm((prev) => ({
                ...prev,
                isPopup,
                description: "",
                imageFile: undefined,
            }));
            setImagePreviewUrl("");

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.description;
                return newErrors;
            });
        },
        [imagePreviewUrl, cleanupImageUrl],
    );

    // 제출 핸들러
    const handleSubmit = useCallback(async () => {
        if (isSubmitting) return;

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            let finalDescription = form.description.trim();

            // 팝업 타입인 경우 이미지 처리
            if (form.isPopup) {
                if (form.imageFile) {
                    try {
                        const uploadedUrls = await uploadImagesToServer([
                            form.imageFile,
                        ]);
                        if (uploadedUrls && uploadedUrls.length > 0) {
                            finalDescription = uploadedUrls[0];
                        } else {
                            throw new Error("이미지 업로드에 실패했습니다.");
                        }
                    } catch (uploadError) {
                        console.error("이미지 업로드 실패:", uploadError);
                        alert(
                            "이미지 업로드에 실패했습니다. 다시 시도해주세요.",
                        );
                        return;
                    }
                } else if (
                    isEditMode &&
                    editingAnnounce &&
                    isImageUrl(editingAnnounce.description)
                ) {
                    finalDescription = editingAnnounce.description;
                }
            }

            // 날짜를 정확한 Date 객체로 변환
            const startDate = new Date(form.startAt);
            const endDate = new Date(form.deletedAt);

            // 추가 날짜 검증
            if (startDate >= endDate) {
                alert("종료일시는 시작일시보다 늦어야 합니다.");
                return;
            }

            const submitData: CreateAnnounceData = {
                isPopup: form.isPopup,
                description: finalDescription,
                startAt: startDate,
                deletedAt: endDate,
                visible: true,
            };

            if (isEditMode && editingAnnounce) {
                await updateAnnounceMutation.mutateAsync({
                    id: editingAnnounce._id.toString(),
                    data: submitData as any,
                });
            } else {
                // 배너 타입인 경우 기존 배너 삭제
                if (!form.isPopup && announces) {
                    const existingBanner = announces.find(
                        (item: IAnnounceDTO) => !item.isPopup,
                    );
                    if (existingBanner) {
                        await deleteAnnounce(existingBanner._id.toString());
                    }
                }

                await createAnnounceMutation.mutateAsync(submitData as any);
            }

            if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
                cleanupImageUrl(imagePreviewUrl);
            }

            cancelEditMode();
            onClose();
        } catch (error) {
            console.error("공지 처리 실패:", error);
            alert(
                `공지 ${isEditMode ? "수정" : "생성"}에 실패했습니다. 다시 시도해주세요.`,
            );
        } finally {
            setIsSubmitting(false);
        }
    }, [
        isSubmitting,
        validateForm,
        form,
        isEditMode,
        editingAnnounce,
        announces,
        createAnnounceMutation,
        updateAnnounceMutation,
        imagePreviewUrl,
        cleanupImageUrl,
        cancelEditMode,
        onClose,
    ]);

    // 제출 버튼 비활성화 조건
    const isSubmitDisabled = useMemo(() => {
        const hasContent = form.isPopup
            ? form.imageFile || (isEditMode && imagePreviewUrl)
            : form.description.trim();

        return (
            isSubmitting ||
            createAnnounceMutation.isPending ||
            updateAnnounceMutation.isPending ||
            !hasContent ||
            Object.keys(errors).length > 0
        );
    }, [
        isSubmitting,
        createAnnounceMutation.isPending,
        updateAnnounceMutation.isPending,
        form.isPopup,
        form.imageFile,
        form.description,
        isEditMode,
        imagePreviewUrl,
        errors,
    ]);

    // 정리 작업
    useEffect(() => {
        return () => {
            if (imagePreviewUrl && imagePreviewUrl.startsWith("blob:")) {
                cleanupImageUrl(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl, cleanupImageUrl]);

    return (
        <Modal
            onClose={onClose}
            className="relative h-[90vh] w-[90vw] overflow-y-auto bg-white shadow-2xl sm:h-[80vh] sm:w-[60vw]"
        >
            {/* PC 버전 */}
            <div
                className="hidden h-full max-h-[calc(100vh-8rem)] w-full max-w-7xl bg-white lg:flex"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 좌측: 공지 생성/수정 폼 */}
                <div className="flex w-1/2 flex-col">
                    <FormHeader isEditMode={isEditMode} />

                    <div className="flex-1 overflow-y-auto p-6">
                        <FormContent
                            isEditMode={isEditMode}
                            editingAnnounce={editingAnnounce}
                            form={form}
                            errors={errors}
                            imagePreviewUrl={imagePreviewUrl}
                            fileInputRef={fileInputRef}
                            ACCEPTED_IMAGE_TYPES={ACCEPTED_IMAGE_TYPES}
                            MAX_DESCRIPTION_LENGTH={MAX_DESCRIPTION_LENGTH}
                            handleInputChange={handleInputChange}
                            handleStyleChange={handleStyleChange}
                            handleImageChange={handleImageChange}
                            handleImageRemove={handleImageRemove}
                            cancelEditMode={cancelEditMode}
                        />
                    </div>

                    <FormFooter
                        isSubmitting={isSubmitting}
                        isSubmitDisabled={isSubmitDisabled}
                        isEditMode={isEditMode}
                        createAnnounceMutation={createAnnounceMutation}
                        updateAnnounceMutation={updateAnnounceMutation}
                        cancelEditMode={cancelEditMode}
                        onClose={onClose}
                        handleSubmit={handleSubmit}
                    />
                </div>

                {/* 우측: 공지 목록 */}
                <div className="flex w-1/2 flex-col border-l border-gray-200">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            현재 공지 목록
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            등록된 공지사항을 확인하고 관리하세요
                        </p>
                    </div>
                    <div className="flex-1 overflow-hidden bg-white">
                        <ListContent
                            listError={listError}
                            isListLoading={isListLoading}
                            announces={announces}
                            populateFormWithAnnounce={populateFormWithAnnounce}
                        />
                    </div>
                </div>
            </div>

            {/* 모바일 버전 */}
            <div
                className="flex h-full max-h-[100vh] w-full flex-col bg-white lg:hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <ModalHeader
                    isEditMode={isEditMode}
                    cancelEditMode={cancelEditMode}
                    onClose={onClose}
                />

                <MobileTabNavigation
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    isEditMode={isEditMode}
                    announceCount={announces?.length || 0}
                />

                {/* 탭 내용 */}
                <div className="flex-1 overflow-hidden">
                    {activeTab === "create" ? (
                        <div className="flex h-full flex-col">
                            <div className="flex-1 overflow-y-auto p-4">
                                <FormContent
                                    isEditMode={isEditMode}
                                    editingAnnounce={editingAnnounce}
                                    form={form}
                                    errors={errors}
                                    imagePreviewUrl={imagePreviewUrl}
                                    fileInputRef={fileInputRef}
                                    ACCEPTED_IMAGE_TYPES={ACCEPTED_IMAGE_TYPES}
                                    MAX_DESCRIPTION_LENGTH={
                                        MAX_DESCRIPTION_LENGTH
                                    }
                                    handleInputChange={handleInputChange}
                                    handleStyleChange={handleStyleChange}
                                    handleImageChange={handleImageChange}
                                    handleImageRemove={handleImageRemove}
                                    cancelEditMode={cancelEditMode}
                                />
                            </div>
                        </div>
                    ) : (
                        <ListContent
                            listError={listError}
                            isListLoading={isListLoading}
                            announces={announces}
                            populateFormWithAnnounce={populateFormWithAnnounce}
                        />
                    )}
                </div>

                {/* 모바일 하단 버튼 */}
                {activeTab === "create" && (
                    <FormFooter
                        isSubmitting={isSubmitting}
                        isSubmitDisabled={isSubmitDisabled}
                        isEditMode={isEditMode}
                        createAnnounceMutation={createAnnounceMutation}
                        updateAnnounceMutation={updateAnnounceMutation}
                        cancelEditMode={cancelEditMode}
                        onClose={onClose}
                        handleSubmit={handleSubmit}
                    />
                )}
            </div>
        </Modal>
    );
}
