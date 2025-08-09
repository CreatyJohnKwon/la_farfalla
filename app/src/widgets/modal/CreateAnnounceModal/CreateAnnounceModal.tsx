"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Modal from "../Modal";
import {
    useCreateAnnounceMutation,
    useAnnouncesQuery,
} from "@/src/shared/hooks/react-query/useAnnounce";
import { IAnnounceDTO } from "@/src/entities/type/announce";
import { deleteAnnounce } from "@/src/shared/lib/server/announce";
import AnnounceList from "./AnnounceList";
import LoadingSpinner from "../../spinner/LoadingSpinner";
import { uploadImagesToServer } from "@/src/shared/lib/uploadToR2";

interface Props {
    onClose: () => void;
}

interface AnnounceForm {
    isPopup: boolean;
    description: string;
    startAt: string;
    deletedAt: string;
    imageFile?: File;
}

interface CreateAnnounceData {
    isPopup: boolean;
    description: string;
    startAt: Date;
    deletedAt: Date;
    visible?: boolean;
    imageFile?: File;
}

const ACCEPTED_IMAGE_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
] as const;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DESCRIPTION_LENGTH = 50;

const getCurrentDateTime = () => {
    const now = new Date();
    const timezoneOffset = now.getTimezoneOffset() * 60000;
    const localTime = new Date(now.getTime() - timezoneOffset);
    return localTime.toISOString().slice(0, 16);
};

const getDateTimeAfterHours = (hours: number) => {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
    const timezoneOffset = future.getTimezoneOffset() * 60000;
    const localTime = new Date(future.getTime() - timezoneOffset);
    return localTime.toISOString().slice(0, 16);
};

export default function CreateAnnounceModal({ onClose }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = useState<"create" | "list">("create");

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

    const {
        data: announces,
        isLoading: isListLoading,
        error: listError,
    } = useAnnouncesQuery();
    const createAnnounceMutation = useCreateAnnounceMutation();

    const cleanupImageUrl = useCallback((url: string) => {
        if (url && url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
        }
    }, []);

    const validateForm = useCallback((): boolean => {
        const newErrors: Partial<Record<keyof AnnounceForm, string>> = {};

        if (form.isPopup) {
            if (!form.imageFile) {
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
    }, [form]);

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

            if (errors[name as keyof AnnounceForm]) {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[name as keyof AnnounceForm];
                    return newErrors;
                });
            }
        },
        [errors],
    );

    const validateImageFile = useCallback((file: File): string | null => {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type as any)) {
            return "JPG, PNG, GIF 파일만 업로드 가능합니다";
        }

        if (file.size > MAX_FILE_SIZE) {
            return "파일 크기는 5MB 이하여야 합니다";
        }

        return null;
    }, []);

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

            if (imagePreviewUrl) {
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

    const handleImageRemove = useCallback(() => {
        if (imagePreviewUrl) {
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

    const handleStyleChange = useCallback(
        (isPopup: boolean) => {
            if (imagePreviewUrl) {
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

    const handleSubmit = useCallback(async () => {
        if (isSubmitting) return;

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            // 배너 타입인 경우 기존 배너 삭제
            if (!form.isPopup && announces) {
                const existingBanner = announces.find(
                    (item: IAnnounceDTO) => !item.isPopup,
                );
                if (existingBanner) {
                    await deleteAnnounce(existingBanner._id.toString());
                }
            }

            let finalDescription = form.description.trim();

            // 팝업 타입이고 이미지 파일이 있는 경우 R2에 업로드
            if (form.isPopup && form.imageFile) {
                try {
                    // uploadImagesToServer 함수를 사용하여 이미지 업로드
                    const uploadedUrls = await uploadImagesToServer([
                        form.imageFile,
                    ]);

                    if (uploadedUrls && uploadedUrls.length > 0) {
                        // 업로드된 이미지 URL을 description에 저장
                        finalDescription = uploadedUrls[0];
                    } else {
                        throw new Error("이미지 업로드에 실패했습니다.");
                    }
                } catch (uploadError) {
                    console.error("이미지 업로드 실패:", uploadError);
                    // 업로드 실패 시 사용자에게 알림
                    alert("이미지 업로드에 실패했습니다. 다시 시도해주세요.");
                    return;
                }
            }

            const submitData: CreateAnnounceData = {
                isPopup: form.isPopup,
                description: finalDescription,
                startAt: new Date(form.startAt),
                deletedAt: new Date(form.deletedAt),
                visible: true,
                // 팝업 타입의 경우 imageFile은 이미 R2에 업로드되었으므로 제외
            };

            await createAnnounceMutation.mutateAsync(submitData as any);

            if (imagePreviewUrl) {
                cleanupImageUrl(imagePreviewUrl);
            }
            onClose();
        } catch (error) {
            console.error("공지 생성 실패:", error);
            // 전반적인 오류 처리
            alert("공지 생성에 실패했습니다. 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    }, [
        isSubmitting,
        validateForm,
        form,
        announces,
        createAnnounceMutation,
        imagePreviewUrl,
        cleanupImageUrl,
        onClose,
    ]);

    const isSubmitDisabled = useMemo(() => {
        return (
            isSubmitting ||
            createAnnounceMutation.isPending ||
            (form.isPopup ? !form.imageFile : !form.description.trim()) ||
            Object.keys(errors).length > 0
        );
    }, [
        isSubmitting,
        createAnnounceMutation.isPending,
        form.isPopup,
        form.imageFile,
        form.description,
        errors,
    ]);

    useEffect(() => {
        return () => {
            if (imagePreviewUrl) {
                cleanupImageUrl(imagePreviewUrl);
            }
        };
    }, [imagePreviewUrl, cleanupImageUrl]);

    // 폼 컴포넌트
    const FormContent = () => (
        <div className="space-y-6">
            {/* 공지 스타일 */}
            <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-900">
                    공지 스타일 <span className="text-blue-600">*</span>
                </label>
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    <label className="group relative flex cursor-pointer items-center gap-4 border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:bg-gray-50 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                        <input
                            type="radio"
                            name="announceStyle"
                            checked={form.isPopup === true}
                            onChange={() => handleStyleChange(true)}
                            className="h-4 w-4 border-2 border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <div>
                            <div className="font-medium text-gray-900">
                                팝업
                            </div>
                            <div className="text-sm text-gray-500">
                                이미지 업로드
                            </div>
                        </div>
                    </label>
                    <label className="group relative flex cursor-pointer items-center gap-4 border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:bg-gray-50 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
                        <input
                            type="radio"
                            name="announceStyle"
                            checked={form.isPopup === false}
                            onChange={() => handleStyleChange(false)}
                            className="h-4 w-4 border-2 border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                        <div>
                            <div className="font-medium text-gray-900">
                                배너
                            </div>
                            <div className="text-sm text-gray-500">
                                텍스트 입력
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            {/* 내용 입력 */}
            <div className="space-y-4">
                {form.isPopup ? (
                    <div>
                        <label className="mb-4 block text-sm font-semibold text-gray-900">
                            팝업 이미지 <span className="text-blue-600">*</span>
                        </label>

                        {!imagePreviewUrl ? (
                            <div className="relative">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                                    onChange={handleImageChange}
                                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                                    id="imageUpload"
                                    aria-describedby="image-upload-description"
                                />
                                <div className="border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center transition-all hover:border-gray-400 hover:bg-gray-100 lg:p-8">
                                    <div className="flex flex-col items-center gap-3 lg:gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center bg-gray-100 lg:h-16 lg:w-16">
                                            <svg
                                                className="h-6 w-6 text-gray-400 lg:h-8 lg:w-8"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-600">
                                                클릭하거나 드래그해서 이미지
                                                업로드
                                            </p>
                                            <p
                                                className="mt-1 text-sm text-gray-400"
                                                id="image-upload-description"
                                            >
                                                PNG, JPG, GIF 파일 지원 (최대
                                                5MB)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative overflow-hidden border border-gray-200 bg-gray-100">
                                <img
                                    src={imagePreviewUrl}
                                    alt="팝업 이미지 미리보기"
                                    className="max-h-48 w-full object-contain lg:max-h-60"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 opacity-0 transition-all hover:bg-opacity-20 hover:opacity-100">
                                    <button
                                        type="button"
                                        onClick={handleImageRemove}
                                        className="bg-red-600 p-2 text-white shadow-lg transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-white"
                                        aria-label="이미지 제거"
                                    >
                                        <svg
                                            className="h-4 w-4 lg:h-5 lg:w-5"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <div className="absolute right-2 top-2 lg:right-3 lg:top-3">
                                    <span className="bg-green-600 px-2 py-1 text-xs font-medium text-white">
                                        업로드 완료
                                    </span>
                                </div>
                                {form.imageFile && (
                                    <div className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)]">
                                        <span className="truncate bg-black/50 px-2 py-1 text-xs text-white">
                                            {form.imageFile.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                        {errors.description && (
                            <p
                                className="mt-2 text-sm text-red-600"
                                role="alert"
                            >
                                {errors.description}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <label
                            htmlFor="description"
                            className="block text-sm font-semibold text-gray-900"
                        >
                            배너 내용 <span className="text-blue-600">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="description"
                                name="description"
                                type="text"
                                value={form.description}
                                onChange={handleInputChange}
                                placeholder="공지 내용을 입력하세요"
                                className={`w-full border p-4 pr-16 outline-none transition-all focus:ring-2 ${
                                    errors.description
                                        ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                        : "border-gray-200 focus:border-blue-600 focus:ring-blue-200"
                                }`}
                                maxLength={MAX_DESCRIPTION_LENGTH}
                                aria-describedby="description-counter description-error"
                            />
                            <div
                                className="absolute right-4 top-1/2 -translate-y-1/2 transform text-sm text-gray-400"
                                id="description-counter"
                            >
                                {form.description.length}/
                                {MAX_DESCRIPTION_LENGTH}
                            </div>
                        </div>
                        {errors.description && (
                            <p
                                className="text-sm text-red-600"
                                role="alert"
                                id="description-error"
                            >
                                {errors.description}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* 날짜 설정 */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                    <label
                        htmlFor="startAt"
                        className="block text-sm font-semibold text-gray-900"
                    >
                        시작일시 <span className="text-blue-600">*</span>
                    </label>
                    <input
                        id="startAt"
                        type="datetime-local"
                        name="startAt"
                        value={form.startAt}
                        onChange={handleInputChange}
                        className={`w-full border p-3 outline-none transition-all focus:ring-2 ${
                            errors.startAt
                                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                : "border-gray-200 focus:border-blue-600 focus:ring-blue-200"
                        }`}
                    />
                    {errors.startAt && (
                        <p className="text-sm text-red-600" role="alert">
                            {errors.startAt}
                        </p>
                    )}
                </div>
                <div className="space-y-2">
                    <label
                        htmlFor="deletedAt"
                        className="block text-sm font-semibold text-gray-900"
                    >
                        종료일시 <span className="text-blue-600">*</span>
                    </label>
                    <input
                        id="deletedAt"
                        type="datetime-local"
                        name="deletedAt"
                        value={form.deletedAt}
                        onChange={handleInputChange}
                        className={`w-full border p-3 outline-none transition-all focus:ring-2 ${
                            errors.deletedAt
                                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                : "border-gray-200 focus:border-blue-600 focus:ring-blue-200"
                        }`}
                    />
                    {errors.deletedAt && (
                        <p className="text-sm text-red-600" role="alert">
                            {errors.deletedAt}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    // 목록 컴포넌트
    const ListContent = () => (
        <div className="h-full overflow-hidden p-2 sm:p-0">
            {listError ? (
                <div className="flex h-full items-center justify-center p-4 lg:p-6">
                    <div className="text-center">
                        <div className="mb-3 flex justify-center lg:mb-4">
                            <svg
                                className="h-10 w-10 text-red-400 lg:h-12 lg:w-12"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <h4 className="font-medium text-gray-900">
                            공지 목록을 불러올 수 없습니다
                        </h4>
                        <p className="mt-1 text-sm text-gray-500">
                            잠시 후 다시 시도해주세요
                        </p>
                    </div>
                </div>
            ) : isListLoading ? (
                <LoadingSpinner size="md" />
            ) : (
                <div className="h-full overflow-y-auto">
                    <AnnounceList announces={announces || []} />
                </div>
            )}
        </div>
    );

    return (
        <Modal
            onClose={onClose}
            className="relative h-[90vh] w-[90vw] overflow-y-auto bg-white shadow-2xl sm:h-[80vh] sm:w-[60vw]"
        >
            {/* PC 버전 */}
            <div className="hidden h-full max-h-[calc(100vh-8rem)] w-full max-w-7xl bg-white lg:flex">
                {/* 좌측: 공지 생성 폼 */}
                <div className="flex w-1/2 flex-col">
                    {/* 폼 헤더 */}
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            새 공지 생성
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            공지사항을 작성하여 사용자에게 알려보세요
                        </p>
                    </div>

                    {/* 폼 내용 */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <FormContent />
                    </div>

                    {/* 폼 푸터 */}
                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                        <div className="flex gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitDisabled}
                                className="flex-1 bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ||
                                createAnnounceMutation.isPending ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent" />
                                        저장 중...
                                    </div>
                                ) : (
                                    "공지 저장하기"
                                )}
                            </button>
                            <button
                                className="border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
                                onClick={onClose}
                            >
                                취소
                            </button>
                        </div>
                    </div>
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
                        <ListContent />
                    </div>
                </div>
            </div>

            {/* 모바일 버전 */}
            <div className="flex h-full max-h-[100vh] w-full flex-col bg-white lg:hidden">
                {/* 모바일 헤더 */}
                <div className="border-b border-gray-200 bg-white px-4 py-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">
                            공지사항 관리
                        </h2>
                        <button
                            onClick={onClose}
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

                {/* 탭 네비게이션 */}
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
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            새 공지 생성
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
                            공지 목록 ({announces?.length || 0})
                        </div>
                    </button>
                </div>

                {/* 탭 내용 */}
                <div className="flex-1 overflow-hidden">
                    {activeTab === "create" ? (
                        <div className="flex h-full flex-col">
                            <div className="flex-1 overflow-y-auto p-4">
                                <FormContent />
                            </div>
                        </div>
                    ) : (
                        <ListContent />
                    )}
                </div>

                {/* 모바일 하단 버튼 (생성 탭에서만 표시) */}
                {activeTab === "create" && (
                    <div className="border-t border-gray-200 bg-white p-4">
                        <div className="flex gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitDisabled}
                                className="flex-1 bg-blue-600 px-4 py-3 font-semibold text-white transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ||
                                createAnnounceMutation.isPending ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent" />
                                        저장 중...
                                    </div>
                                ) : (
                                    "공지 저장하기"
                                )}
                            </button>
                            <button
                                className="border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
                                onClick={onClose}
                            >
                                취소
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
