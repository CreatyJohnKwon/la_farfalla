import { FormContentProps } from "@/src/entities/type/announce";
import { memo } from "react";

const FormContent = memo(
    ({
        isEditMode,
        editingAnnounce,
        form,
        errors,
        imagePreviewUrl,
        fileInputRef,
        ACCEPTED_IMAGE_TYPES,
        MAX_DESCRIPTION_LENGTH,
        handleInputChange,
        handleStyleChange,
        handleImageChange,
        handleImageRemove,
        cancelEditMode,
    }: FormContentProps) => {
        // 안전한 기본값 보장 (수정 모드에서는 기존 데이터 우선 사용)
        const safeForm = {
            isPopup: Boolean(form?.isPopup), // 더 명확한 boolean 변환
            description: form?.description ?? "",
            textColor:
                form?.textColor ??
                (isEditMode && editingAnnounce?.textColor
                    ? editingAnnounce.textColor
                    : "000000"),
            backgroundColor:
                form?.backgroundColor ??
                (isEditMode && editingAnnounce?.backgroundColor
                    ? editingAnnounce.backgroundColor
                    : "ffffff"),
            startAt: form?.startAt ?? "",
            deletedAt: form?.deletedAt ?? "",
            imageFile: form?.imageFile,
        };

        const safeErrors = errors ?? {};
        const safeImagePreviewUrl = imagePreviewUrl ?? "";

        // 헥스 코드 유효성 검사 함수 (# 없이)
        const isValidHex = (hex: string) => {
            return /^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
        };

        return (
            <div className="space-y-6">
                {/* 수정 모드 표시 */}
                {isEditMode && editingAnnounce && (
                    <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                                <svg
                                    className="h-4 w-4 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-900">
                                    공지사항 수정 중
                                </h4>
                                <p className="text-sm text-blue-700">
                                    {editingAnnounce.isPopup ? "팝업" : "배너"}{" "}
                                    공지를 수정하고 있습니다
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={cancelEditMode}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-blue-600 hover:bg-blue-100"
                            title="수정 취소"
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
                    </div>
                )}
                {/* 공지 스타일 - 수정 모드에서는 비활성화 */}
                <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-900">
                        공지 스타일 <span className="text-blue-600">*</span>
                        {isEditMode && (
                            <span className="ml-2 text-xs text-gray-500">
                                (수정 시 변경 불가)
                            </span>
                        )}
                    </label>
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        <button
                            type="button"
                            onClick={() =>
                                !isEditMode && handleStyleChange(true)
                            }
                            disabled={isEditMode}
                            className={`flex cursor-pointer items-center gap-4 border p-4 text-left transition-all ${
                                isEditMode
                                    ? "cursor-not-allowed opacity-60"
                                    : "hover:border-gray-300 hover:bg-gray-50"
                            } ${
                                safeForm.isPopup === true
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 bg-white"
                            }`}
                        >
                            <div>
                                <div
                                    className={`font-medium ${
                                        safeForm.isPopup === true
                                            ? "text-blue-700"
                                            : "text-gray-900"
                                    }`}
                                >
                                    팝업
                                </div>
                                <div
                                    className={`text-sm ${
                                        safeForm.isPopup === true
                                            ? "text-blue-600"
                                            : "text-gray-500"
                                    }`}
                                >
                                    이미지 업로드
                                </div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                !isEditMode && handleStyleChange(false)
                            }
                            disabled={isEditMode}
                            className={`flex cursor-pointer items-center gap-4 border p-4 text-left transition-all ${
                                isEditMode
                                    ? "cursor-not-allowed opacity-60"
                                    : "hover:border-gray-300 hover:bg-gray-50"
                            } ${
                                safeForm.isPopup === false
                                    ? "border-blue-600 bg-blue-50"
                                    : "border-gray-200 bg-white"
                            }`}
                        >
                            <div>
                                <div
                                    className={`font-medium ${
                                        safeForm.isPopup === false
                                            ? "text-blue-700"
                                            : "text-gray-900"
                                    }`}
                                >
                                    배너
                                </div>
                                <div
                                    className={`text-sm ${
                                        safeForm.isPopup === false
                                            ? "text-blue-600"
                                            : "text-gray-500"
                                    }`}
                                >
                                    텍스트 입력
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
                {/* 내용 입력 */}
                <div className="space-y-4">
                    {safeForm.isPopup ? (
                        <div>
                            <label className="mb-4 block text-sm font-semibold text-gray-900">
                                팝업 이미지{" "}
                                <span className="text-blue-600">*</span>
                                {isEditMode &&
                                    safeImagePreviewUrl &&
                                    !safeImagePreviewUrl.startsWith(
                                        "blob:",
                                    ) && (
                                        <span className="ml-2 text-xs text-gray-500">
                                            (새 이미지 업로드 시 기존 이미지
                                            교체)
                                        </span>
                                    )}
                            </label>

                            {!safeImagePreviewUrl ? (
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
                                                    PNG, JPG, GIF 파일 지원
                                                    (최대 5MB)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative overflow-hidden border border-gray-200 bg-gray-100">
                                    <img
                                        src={safeImagePreviewUrl}
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
                                            {safeImagePreviewUrl.startsWith(
                                                "blob:",
                                            )
                                                ? "업로드 완료"
                                                : "기존 이미지"}
                                        </span>
                                    </div>
                                </div>
                            )}
                            {safeErrors.description && (
                                <p
                                    className="mt-2 text-sm text-red-600"
                                    role="alert"
                                >
                                    {safeErrors.description}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* 배너 내용 */}
                            <div className="space-y-4">
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-semibold text-gray-900"
                                >
                                    배너 내용{" "}
                                    <span className="text-blue-600">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        id="description"
                                        name="description"
                                        type="text"
                                        value={safeForm.description}
                                        onChange={handleInputChange}
                                        placeholder="공지 내용을 입력하세요"
                                        className={`w-full border p-4 pr-16 outline-none transition-all focus:ring-2 ${
                                            safeErrors.description
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
                                        {safeForm.description.length}/
                                        {MAX_DESCRIPTION_LENGTH}
                                    </div>
                                </div>
                                {safeErrors.description && (
                                    <p
                                        className="text-sm text-red-600"
                                        role="alert"
                                        id="description-error"
                                    >
                                        {safeErrors.description}
                                    </p>
                                )}
                            </div>

                            {/* 색상 설정 */}
                            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {/* 텍스트 색상 */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="textColor"
                                        className="block text-sm font-semibold text-gray-900"
                                    >
                                        텍스트 색상{" "}
                                        <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        {/* # 프리픽스 */}
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 transform font-mono text-gray-500">
                                            #
                                        </div>
                                        <input
                                            id="textColor"
                                            name="textColor"
                                            type="text"
                                            value={safeForm.textColor}
                                            onChange={handleInputChange}
                                            placeholder="000000"
                                            className={`w-full border p-3 pl-8 pr-12 font-mono outline-none transition-all focus:ring-2 ${
                                                safeErrors.textColor
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                                    : "border-gray-200 focus:border-blue-600 focus:ring-blue-200"
                                            }`}
                                            maxLength={6}
                                        />
                                        {/* 색상 미리보기 박스 */}
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
                                            <div
                                                className={`h-6 w-6 rounded border border-gray-300 ${
                                                    isValidHex(
                                                        safeForm.textColor,
                                                    )
                                                        ? "opacity-100"
                                                        : "bg-gray-200 opacity-50"
                                                }`}
                                                style={{
                                                    backgroundColor: isValidHex(
                                                        safeForm.textColor,
                                                    )
                                                        ? `#${safeForm.textColor}`
                                                        : "#e5e7eb",
                                                }}
                                                title={`미리보기: #${safeForm.textColor}`}
                                            />
                                        </div>
                                    </div>
                                    {safeErrors.textColor && (
                                        <p
                                            className="text-sm text-red-600"
                                            role="alert"
                                        >
                                            {safeErrors.textColor}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        예시: 000000 (검정), ffffff (흰색),
                                        ff0000 (빨강)
                                    </p>
                                </div>

                                {/* 띠지 배경색 */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="backgroundColor"
                                        className="block text-sm font-semibold text-gray-900"
                                    >
                                        띠지 배경색{" "}
                                        <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        {/* # 프리픽스 */}
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 transform font-mono text-gray-500">
                                            #
                                        </div>
                                        <input
                                            id="backgroundColor"
                                            name="backgroundColor"
                                            type="text"
                                            value={safeForm.backgroundColor}
                                            onChange={handleInputChange}
                                            placeholder="ffffff"
                                            className={`w-full border p-3 pl-8 pr-12 font-mono outline-none transition-all focus:ring-2 ${
                                                safeErrors.backgroundColor
                                                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                                    : "border-gray-200 focus:border-blue-600 focus:ring-blue-200"
                                            }`}
                                            maxLength={6}
                                        />
                                        {/* 색상 미리보기 박스 */}
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
                                            <div
                                                className={`h-6 w-6 rounded border border-gray-300 ${
                                                    isValidHex(
                                                        safeForm.backgroundColor,
                                                    )
                                                        ? "opacity-100"
                                                        : "bg-gray-200 opacity-50"
                                                }`}
                                                style={{
                                                    backgroundColor: isValidHex(
                                                        safeForm.backgroundColor,
                                                    )
                                                        ? `#${safeForm.backgroundColor}`
                                                        : "#e5e7eb",
                                                }}
                                                title={`미리보기: #${safeForm.backgroundColor}`}
                                            />
                                        </div>
                                    </div>
                                    {safeErrors.backgroundColor && (
                                        <p
                                            className="text-sm text-red-600"
                                            role="alert"
                                        >
                                            {safeErrors.backgroundColor}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        예시: ffffff (흰색), f0f0f0 (연회색),
                                        007bff (파랑)
                                    </p>
                                </div>
                            </div>

                            {/* 배너 미리보기 */}
                            {safeForm.description &&
                                isValidHex(safeForm.textColor) &&
                                isValidHex(safeForm.backgroundColor) && (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-gray-900">
                                            배너 미리보기
                                        </label>
                                        <div
                                            className="border border-gray-200 p-4 text-center font-medium"
                                            style={{
                                                color: `#${safeForm.textColor}`,
                                                backgroundColor: `#${safeForm.backgroundColor}`,
                                            }}
                                        >
                                            {safeForm.description}
                                        </div>
                                    </div>
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
                            value={safeForm.startAt}
                            onChange={handleInputChange}
                            className={`w-full border p-3 outline-none transition-all focus:ring-2 ${
                                safeErrors.startAt
                                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                    : "border-gray-200 focus:border-blue-600 focus:ring-blue-200"
                            }`}
                        />
                        {safeErrors.startAt && (
                            <p className="text-sm text-red-600" role="alert">
                                {safeErrors.startAt}
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
                            value={safeForm.deletedAt}
                            onChange={handleInputChange}
                            className={`w-full border p-3 outline-none transition-all focus:ring-2 ${
                                safeErrors.deletedAt
                                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                                    : "border-gray-200 focus:border-blue-600 focus:ring-blue-200"
                            }`}
                        />
                        {safeErrors.deletedAt && (
                            <p className="text-sm text-red-600" role="alert">
                                {safeErrors.deletedAt}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    },
);

FormContent.displayName = "FormContent";

export default FormContent;
