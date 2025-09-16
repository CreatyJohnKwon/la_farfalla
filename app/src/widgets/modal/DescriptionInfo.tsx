import Image from "next/image";
import { useRef } from "react";
import { DescriptionInfoProps } from "./interface";

const DescriptionInfo = ({
    formData,
    handleInputChange,
    hasDescriptionImageChanges,
    setHasDescriptionImageChanges,
    descriptionImageData,
    setDescriptionImageData,
}: DescriptionInfoProps) => {
    const descriptionFileInputRef = useRef<HTMLInputElement>(null);

    // 설명 이미지 제거 핸들러
    const removeDescriptionImage = (index: number): void => {
        const newPreviews = [...descriptionImageData.previews];
        const newFiles = [...descriptionImageData.files];
        const newExistingUrls = [...descriptionImageData.existingUrls];

        const isExistingImage =
            index < descriptionImageData.existingUrls.length;

        if (isExistingImage) {
            newExistingUrls.splice(index, 1);
            newPreviews.splice(index, 1);
        } else {
            const fileIndex = index - descriptionImageData.existingUrls.length;
            newFiles.splice(fileIndex, 1);
            newPreviews.splice(index, 1);
        }

        setDescriptionImageData({
            previews: newPreviews,
            files: newFiles,
            existingUrls: newExistingUrls,
        });

        setHasDescriptionImageChanges(true);
    };

    // 설명 이미지 업로드 핸들러
    const handleDescriptionImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
    ): void => {
        const files = Array.from(e.target.files || []);
        const newFiles = [...descriptionImageData.files, ...files];
        setHasDescriptionImageChanges(true);

        const newPreviews = [...descriptionImageData.previews];
        let processedCount = 0;

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    newPreviews.push(e.target.result as string);
                    processedCount++;

                    if (processedCount === files.length) {
                        setDescriptionImageData({
                            previews: newPreviews,
                            files: newFiles,
                            existingUrls: descriptionImageData.existingUrls,
                        });
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    };

    return (
        <div className="border border-gray-200 bg-gray-50 p-6">
            <label className="mb-4 block text-sm font-semibold text-gray-900">
                상품 설명 *
            </label>
            <textarea
                name="descriptionText"
                value={formData.description.text}
                onChange={handleInputChange}
                className="mb-4 w-full resize-none border border-gray-300 px-4 py-3 transition-colors hover:border-gray-400 focus:border-gray-500 focus:outline-none"
                placeholder="상품 설명을 입력하세요 (최대 500자)"
                rows={3}
                maxLength={500}
            />

            <label className="mb-2 block text-sm font-semibold text-gray-900">
                추가 상세설명 *
            </label>
            <textarea
                name="descriptionDetailText"
                value={formData.description.detail}
                onChange={handleInputChange}
                className="mb-6 w-full resize-none border border-gray-300 px-4 py-3 transition-colors hover:border-gray-400 focus:border-gray-500 focus:outline-none"
                placeholder="상품 설명을 입력하세요 (최대 150자)"
                rows={3}
                maxLength={150}
            />

            {/* 설명 이미지 섹션 */}
            <div className="border-2 border-dashed border-gray-300 bg-white p-6">
                <label className="mb-4 block text-sm font-semibold text-gray-900">
                    상품 설명 이미지 *
                    {hasDescriptionImageChanges && (
                        <span className="ml-2 bg-gray-200 px-2 py-1 text-xs text-gray-700">
                            변경됨
                        </span>
                    )}
                </label>

                {descriptionImageData.previews.length > 0 && (
                    <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                        {descriptionImageData.previews.map(
                            (preview, index: number) => (
                                <div
                                    key={index}
                                    className="relative aspect-square border border-gray-200"
                                >
                                    <Image
                                        src={preview}
                                        alt={`설명 이미지 ${index + 1}`}
                                        width={500}
                                        height={500}
                                        className="h-full w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeDescriptionImage(index)
                                        }
                                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center bg-gray-900 text-sm text-white transition-colors hover:bg-gray-700"
                                    >
                                        ×
                                    </button>
                                </div>
                            ),
                        )}
                    </div>
                )}

                <div className="space-y-4 text-center">
                    <div className="text-sm text-gray-600">
                        설명 이미지를 업로드하세요 (세로로 연결될 이미지들)
                    </div>
                    <input
                        ref={descriptionFileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleDescriptionImageUpload}
                        className="block w-full cursor-pointer text-sm text-gray-600 file:mr-4 file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-700"
                    />
                    <p className="text-xs text-gray-500">
                        JPG, PNG, GIF 파일을 지원합니다. 현재{" "}
                        {descriptionImageData.previews.length}개
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DescriptionInfo;
