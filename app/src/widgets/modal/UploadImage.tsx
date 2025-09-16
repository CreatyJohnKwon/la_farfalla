import Image from "next/image";
import { useRef } from "react";
import { UploadImageProps } from "./interface";

const UploadImage = ({
    mode,
    imageData,
    setImageData,
    hasImageChanges,
    setHasImageChanges,
}: UploadImageProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 이미지 업로드 핸들러
    const handleImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
    ): void => {
        const files = Array.from(e.target.files || []);
        const currentImageCount = imageData.previews.length;

        if (currentImageCount + files.length > 3) {
            alert("이미지는 최대 3개까지만 업로드할 수 있습니다.");
            return;
        }

        const newFiles = [...imageData.files, ...files];
        setHasImageChanges(true);

        const newPreviews = [...imageData.previews];
        let processedCount = 0;

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    newPreviews.push(e.target.result as string);
                    processedCount++;

                    if (processedCount === files.length) {
                        setImageData({
                            previews: newPreviews,
                            files: newFiles,
                            existingUrls: imageData.existingUrls,
                        });
                    }
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number): void => {
        const newPreviews = [...imageData.previews];
        const newFiles = [...imageData.files];
        const newExistingUrls = [...imageData.existingUrls];

        const isExistingImage = index < imageData.existingUrls.length;

        if (isExistingImage) {
            newExistingUrls.splice(index, 1);
            newPreviews.splice(index, 1);
        } else {
            const fileIndex = index - imageData.existingUrls.length;
            newFiles.splice(fileIndex, 1);
            newPreviews.splice(index, 1);
        }

        setImageData({
            previews: newPreviews,
            files: newFiles,
            existingUrls: newExistingUrls,
        });

        setHasImageChanges(true);
    };

    return (
        <div className="border border-gray-200 bg-gray-50 p-6">
            <label className="mb-4 block text-sm font-semibold text-gray-900">
                상품 이미지 *
                <span className="ml-2 text-xs font-normal text-gray-500">
                    필수 3개
                </span>
            </label>

            <div className="mb-6 grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={index}
                        className="group relative flex aspect-square items-center justify-center border-2 border-dashed border-gray-300 bg-white transition-colors hover:border-gray-400"
                    >
                        {imageData.previews[index] ? (
                            <>
                                <Image
                                    src={imageData.previews[index]}
                                    alt={`Preview ${index + 1}`}
                                    width={500}
                                    height={500}
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center bg-gray-900 text-sm text-white transition-colors hover:bg-gray-700"
                                >
                                    ×
                                </button>
                            </>
                        ) : (
                            <div className="text-center text-gray-400 group-hover:text-gray-600">
                                <div className="mb-2 text-2xl">+</div>
                                <div className="text-xs font-medium">
                                    이미지 {index + 1}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="block w-full cursor-pointer text-sm text-gray-600 file:mr-4 file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-gray-700"
            />
            <p className="mt-2 text-xs text-gray-600">
                현재 {imageData.previews.length}/3개
                {mode === "update" && hasImageChanges && (
                    <span className="ml-2 bg-gray-200 px-2 py-1 text-xs text-gray-700">
                        변경됨
                    </span>
                )}
            </p>
        </div>
    );
};

export default UploadImage;
