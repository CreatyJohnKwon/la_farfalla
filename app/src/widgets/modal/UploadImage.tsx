import Image from "next/image";
import { useRef, useState, DragEvent } from "react";
import { UploadImageProps } from "./interface";

const UploadImage = ({
    mode,
    imageData,
    setImageData,
    hasImageChanges,
    setHasImageChanges,
}: UploadImageProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    // ✨ 파일 처리 로직을 별도 함수로 분리하여 재사용
    const processFiles = (files: File[]) => {
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

    // 이미지 업로드 핸들러
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        if (selectedFiles.length > 0) {
            processFiles(selectedFiles);
        }
    };
    
    // 파일 업로드를 위한 드래그 앤 드롭 핸들러
    const handleDragOverUpload = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        // ✨ 순서 변경 중에는 업로드 UI가 활성화되지 않도록 방지
        if (draggedIndex === null && !isDragging) {
            setIsDragging(true);
        }
    };

    const handleDragLeaveUpload = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDropUpload = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        // ✨ 순서 변경 중에는 파일 드롭 무시
        if (draggedIndex !== null) return;

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (droppedFiles.length > 0) {
            processFiles(droppedFiles);
        }
    };

    // ✨ 순서 변경을 위한 드래그 앤 드롭 핸들러
    const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        // dataTransfer는 필수적이지는 않지만, 일부 브라우저 호환성을 위해 추가
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (e: DragEvent<HTMLDivElement>, targetIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        // ✨ 핵심 로직: 배열 순서 변경
        // 1. previews 배열 순서 변경
        const newPreviews = [...imageData.previews];
        const [draggedItem] = newPreviews.splice(draggedIndex, 1);
        newPreviews.splice(targetIndex, 0, draggedItem);
        
        // 2. 원본 데이터(existingUrls, files)도 동기화
        //    previews 배열은 existingUrls와 files가 합쳐진 순서와 동일
        const combinedSources = [
            ...imageData.existingUrls.map(url => ({ type: 'existing', value: url })),
            ...imageData.files.map(file => ({ type: 'new', value: file }))
        ];
        
        const [draggedSource] = combinedSources.splice(draggedIndex, 1);
        combinedSources.splice(targetIndex, 0, draggedSource);

        const newExistingUrls = combinedSources.filter(item => item.type === 'existing').map(item => item.value as string);
        const newFiles = combinedSources.filter(item => item.type === 'new').map(item => item.value as File);

        setDraggedIndex(targetIndex); // 드래그 인덱스를 현재 위치로 업데이트
        setImageData({
            previews: newPreviews,
            files: newFiles,
            existingUrls: newExistingUrls,
        });
        setHasImageChanges(true);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null); // 드래그 종료 시 인덱스 초기화
    };


    const removeImage = (index: number): void => {
        const newPreviews = [...imageData.previews];
        const newFiles = [...imageData.files];
        const newExistingUrls = [...imageData.existingUrls];

        const combinedSources = [
            ...imageData.existingUrls.map(url => ({ type: 'existing', value: url })),
            ...imageData.files.map(file => ({ type: 'new', value: file }))
        ];

        const itemToRemove = combinedSources[index];

        if (itemToRemove.type === 'existing') {
            const urlIndex = newExistingUrls.indexOf(itemToRemove.value as string);
            if(urlIndex > -1) newExistingUrls.splice(urlIndex, 1);
        } else {
            const fileIndex = newFiles.indexOf(itemToRemove.value as File);
            if(fileIndex > -1) newFiles.splice(fileIndex, 1);
        }
        
        newPreviews.splice(index, 1);

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

            <div
                onDragOver={handleDragOverUpload}
                onDragLeave={handleDragLeaveUpload}
                onDrop={handleDropUpload}
                className={`mb-6 grid grid-cols-3 gap-4 rounded-lg border-2 border-dashed p-2 transition-colors
                    ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-transparent'}
                `}
            >
                {Array.from({ length: 3 }).map((_, index) => (
                    <div
                        key={imageData.previews[index] || `empty-${index}`}
                        draggable={!!imageData.previews[index]}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()} // onDragEnter를 활성화하기 위해 필요
                        className={`group relative flex aspect-square items-center justify-center border-2 border-dashed border-gray-300 bg-white transition-all
                            ${imageData.previews[index] ? 'cursor-grab' : 'cursor-pointer'}
                            ${draggedIndex === index ? 'opacity-30' : 'opacity-100'}
                        `}
                    >
                        {imageData.previews[index] ? (
                            <>
                                <Image
                                    src={imageData.previews[index]}
                                    alt={`Preview ${index + 1}`}
                                    width={500}
                                    height={500}
                                    className="object-cover pointer-events-none"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(index);
                                    }}
                                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center bg-gray-900 text-sm text-white transition-colors hover:bg-gray-700"
                                >
                                    ×
                                </button>
                            </>
                        ) : (
                            <div className="text-center text-gray-400 group-hover:text-gray-600">
                                {isDragging ? (
                                    <div className="text-xs font-bold text-blue-600">여기에 드롭하세요</div>
                                ) : (
                                    <>
                                        <div className="mb-2 text-2xl">+</div>
                                        <div className="text-xs font-medium">
                                            이미지 {index + 1}
                                        </div>
                                    </>
                                )}
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
                className="hidden"
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
