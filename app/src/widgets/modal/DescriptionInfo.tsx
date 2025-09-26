import Image from "next/image";
import { useRef, useState, useMemo, DragEvent, useEffect } from "react";
import { DescriptionInfoProps } from "./interface"; // 기존 interface 사용
import { v4 as uuidv4 } from 'uuid'; // uuid 설치 필요: npm install uuid @types/uuid
import { ImageData } from "@/src/components/product/interface";
import { BREAK_IDENTIFIER } from "@/src/utils/dataUtils";

// 렌더링 및 조작을 위한 내부 아이템 타입
type DescriptionItem = {
    id: string; // 각 아이템을 구별하기 위한 고유 ID
    type: 'image' | 'break';
    preview: string; // 이미지 URL 또는 BREAK_IDENTIFIER
    source: { type: 'existing' } | { type: 'file', file: File };
};

const DescriptionInfo = ({
    formData,
    handleInputChange,
    hasDescriptionImageChanges,
    setHasDescriptionImageChanges,
    descriptionImageData,
    setDescriptionImageData,
}: DescriptionInfoProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null); // 시각적 도우미
    const [isFileDragging, setIsFileDragging] = useState(false); // 드래그 드롭 첨부 추적

    useEffect(() => {
        console.log(descriptionImageData)
    }, [descriptionImageData])

    const descriptionItems = useMemo<DescriptionItem[]>(() => {
        const items: DescriptionItem[] = [];
        let fileIndex = 0;

        descriptionImageData.previews.forEach((preview, index) => {
            if (preview === BREAK_IDENTIFIER) {
                items.push({
                    // ✨ 안정적인 ID (2): 줄바꿈은 인덱스 기반으로 생성
                    id: `break-${index}`,
                    type: 'break',
                    preview: BREAK_IDENTIFIER,
                    source: { type: 'existing' },
                });
            } else {
                const isExisting = descriptionImageData.existingUrls.includes(preview);
                if (isExisting) {
                    items.push({
                        // ✨ 안정적인 ID (1): 이미지는 고유한 URL을 ID로 사용
                        id: preview,
                        type: 'image',
                        preview: preview,
                        source: { type: 'existing' },
                    });
                } else {
                    const file = descriptionImageData.files[fileIndex];
                    if (file) {
                        items.push({
                            // ✨ 안정적인 ID (1): 새로 추가된 이미지도 고유한 blob URL을 ID로 사용
                            id: preview,
                            type: 'image',
                            preview: preview,
                            source: { type: 'file', file: file },
                        });
                        fileIndex++;
                    }
                }
            }
        });
        return items;
    }, [descriptionImageData]);

    // ✨ 변경된 내부 아이템 목록을 부모의 state 형식으로 변환하여 업데이트하는 함수
    const updateParentState = (items: DescriptionItem[]) => {
        const newImageData: ImageData = {
            previews: [],
            files: [],
            existingUrls: [],
        };

        items.forEach(item => {
            newImageData.previews.push(item.preview);
            if (item.type === 'break') {
                newImageData.existingUrls.push(BREAK_IDENTIFIER);
            } else if (item.source.type === 'existing') {
                newImageData.existingUrls.push(item.preview);
            } else if (item.source.type === 'file') {
                newImageData.files.push(item.source.file);
            }
        });

        setDescriptionImageData(newImageData);
        if (!hasDescriptionImageChanges) {
            setHasDescriptionImageChanges(true);
        }
    };

    // 이미지 업로드 핸들러
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newItems: DescriptionItem[] = files.map(file => ({
            id: uuidv4(),
            type: 'image',
            preview: URL.createObjectURL(file),
            source: { type: 'file', file: file },
        }));
        updateParentState([...descriptionItems, ...newItems]);
    };
    
    // 아이템(이미지 또는 줄바꿈) 제거
    const removeItem = (id: string) => {
        const newItems = descriptionItems.filter(item => item.id !== id);
        updateParentState(newItems);
    };

    // 줄바꿈 추가
    const addBreak = (index: number) => {
        const newBreak: DescriptionItem = {
            // 새 아이템 생성 시에만 uuid를 사용하여 초기 고유성을 확보합니다.
            id: uuidv4(),
            type: 'break',
            preview: BREAK_IDENTIFIER,
            source: { type: 'existing' },
        };
        const newItems = [...descriptionItems];
        newItems.splice(index + 1, 0, newBreak);
        updateParentState(newItems);
    };

    const processFiles = (files: File[]) => {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        if (imageFiles.length === 0) return;

        const newItems: DescriptionItem[] = imageFiles.map(file => ({
            id: uuidv4(),
            type: 'image',
            preview: URL.createObjectURL(file),
            source: { type: 'file', file: file },
        }));
        updateParentState([...descriptionItems, ...newItems]);
    };
    
    // --- 순서 변경(Internal) 드래그 핸들러 ---
    const handleDragStart = (id: string) => setDraggedId(id);
    const handleDragOverItem = (e: DragEvent<HTMLDivElement>, targetId: string) => {
        e.preventDefault();
        if (targetId !== dragOverId) setDragOverId(targetId);
    };
    const handleDropOnItem = (targetId: string) => {
        if (draggedId === null || draggedId === targetId) return;
        const newItems = [...descriptionItems];
        const draggedIndex = newItems.findIndex(item => item.id === draggedId);
        const targetIndex = newItems.findIndex(item => item.id === targetId);
        const [draggedItem] = newItems.splice(draggedIndex, 1);
        newItems.splice(targetIndex, 0, draggedItem);
        updateParentState(newItems);
    };
    const handleDragEnd = () => {
        setDraggedId(null);
        setDragOverId(null);
    };

    // --- 파일 추가(External) 드래그 핸들러 ---
    const handleFileDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        // 내부 아이템을 드래그 중일 때는 파일 드롭 UI를 활성화하지 않음
        if (draggedId === null) {
            setIsFileDragging(true);
        }
    };
    const handleFileDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFileDragging(false);
    };
    const handleFileDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFileDragging(false);
        // 내부 아이템 드롭이 아닐 때만 파일 처리
        if (draggedId === null) {
            const files = Array.from(e.dataTransfer.files);
            processFiles(files);
        }
    };

    return (
        <div className="rounded-sm">
            <label className="mb-4 block text-sm font-semibold text-gray-900">상품 설명 *</label>
            <textarea
                name="descriptionText"
                value={formData.description.text}
                onChange={handleInputChange}
                // ✨ className 복구
                className="mb-4 w-full resize-none rounded-md border border-gray-300 px-4 py-3 text-sm transition-colors placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="상품 설명을 입력하세요 (최대 500자)"
                rows={3}
                maxLength={500}
            />
            {/* ✨ 주석 처리되었던 추가 상세설명 textarea도 복구 */}
            <label className="mb-2 block text-sm font-semibold text-gray-900">
                추가 상세설명
            </label>
            <textarea
                name="descriptionDetailText"
                value={formData.description.detail}
                onChange={handleInputChange}
                className="mb-6 w-full resize-none rounded-md border border-gray-300 px-4 py-3 text-sm transition-colors placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                placeholder="추가 상세 설명을 입력하세요 (최대 150자)"
                rows={2}
                maxLength={150}
            />

            <div
                // ✨ 파일 드롭을 위한 이벤트 핸들러를 최상위 Drop Zone에 추가
                onDragOver={handleFileDragOver}
                onDragLeave={handleFileDragLeave}
                onDrop={handleFileDrop}
                className="relative rounded-md border-2 border-dashed border-gray-300 bg-white p-6 transition-colors"
            >
                {/* ✨ 파일 드래그 시 나타나는 오버레이 UI */}
                {isFileDragging && (
                    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-md bg-blue-500 bg-opacity-20 ring-4 ring-blue-400">
                        <span className="font-bold text-blue-600">여기에 이미지를 드롭하여 추가하세요</span>
                    </div>
                )}

                <label className="mb-4 block text-sm font-semibold text-gray-900">
                    상품 설명 이미지 (드래그하여 순서 변경 및 파일 추가)
                </label>
                
                <div className="space-y-4">
                    {descriptionItems.map((item, index) => (
                         <div key={item.id} className="relative">
                            <div
                                draggable
                                onDragStart={() => handleDragStart(item.id)}
                                onDragOver={(e) => handleDragOverItem(e, item.id)}
                                onDrop={() => handleDropOnItem(item.id)}
                                onDragEnd={handleDragEnd}
                                className={`transition-opacity ${draggedId === item.id ? 'opacity-30' : ''}`}
                            >
                                {item.type === 'image' ? (
                                    <div className="group relative aspect-video w-full cursor-grab border-gray-200 bg-gray-100">
                                        <Image src={item.preview} alt={`설명 이미지`} fill className="pointer-events-none object-contain" />
                                        <button type="button" onClick={() => removeItem(item.id)} className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-gray-800 text-sm font-bold text-white opacity-0 transition-all hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 group-hover:opacity-100">×</button>
                                    </div>
                                ) : (
                                    <div className="relative group flex items-center justify-center py-2">
                                        <hr className="w-full border-t-2 border-dashed border-blue-300" />
                                        <span className="absolute bg-white px-2 text-sm font-medium text-blue-500">줄바꿈</span>
                                        <button type="button" onClick={() => removeItem(item.id)} className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-600 opacity-0 ring-1 ring-inset ring-gray-300 transition-all hover:bg-red-100 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 group-hover:opacity-100">×</button>
                                    </div>
                                )}
                            </div>
                            {item.type === 'image' && (
                                <div className="my-2 flex justify-center">
                                    <button type="button" onClick={() => addBreak(index)} className="rounded-full px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:underline">[+] 줄바꿈 추가</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-6 space-y-4 text-center">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full cursor-pointer rounded-md bg-gray-800 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">이미지 추가하기</button>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                </div>
            </div>
        </div>
    );
};

export default DescriptionInfo;