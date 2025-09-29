"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import Image from "next/image";
import { v4 as uuidv4 } from 'uuid';
import { useCreateProjectMutation, useUpdateProjectMutation } from "@/src/shared/hooks/react-query/useProjectQuery";
import { IProject } from "@/src/entities/type/project";

type DescriptionItem = {
    id: string;
    type: 'image' | 'break';
    source: 'existing' | 'new';
    file?: File;
    previewUrl: string;
};

interface ProjectFormProps {
    project?: IProject;
    onClose: () => void;
}

const ProjectForm = ({ project, onClose }: ProjectFormProps) => {
    const isUpdateMode = !!project;

    const [title, setTitle] = useState('');
    const [mainImageFile, setMainImageFile] = useState<File | null>(null);
    const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
    const [descriptionItems, setDescriptionItems] = useState<DescriptionItem[]>([]);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const descriptionFileInputRef = useRef<HTMLInputElement>(null);

    const { mutate: createProject, isPending: isCreating } = useCreateProjectMutation();
    const { mutate: updateProject, isPending: isUpdating } = useUpdateProjectMutation();

    const isPending = isCreating || isUpdating;

    useEffect(() => {
        if (isUpdateMode && project) {
            setTitle(project.title);
            setMainImagePreview(project.image);
            const initialItems: DescriptionItem[] = project.description.map(item => ({
                id: item.src || uuidv4(),
                type: item.itemType,
                source: 'existing',
                previewUrl: item.src || '',
            }));
            setDescriptionItems(initialItems);
        } else {
            setTitle('');
            setMainImageFile(null);
            setMainImagePreview(null);
            setDescriptionItems([]);
        }
    }, [project, isUpdateMode]);

    useEffect(() => {
        return () => {
            if (mainImagePreview && mainImagePreview.startsWith('blob:')) URL.revokeObjectURL(mainImagePreview);
            descriptionItems.forEach(item => {
                if (item.previewUrl && item.previewUrl.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl);
            });
        };
    }, [mainImagePreview, descriptionItems]);

    const handleMainImageChange = (files: FileList | null) => {
        const file = files?.[0];
        if (file) {
            setMainImageFile(file);
            if (mainImagePreview && mainImagePreview.startsWith('blob:')) URL.revokeObjectURL(mainImagePreview);
            setMainImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDescriptionFiles = (files: File[]) => {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        const newItems: DescriptionItem[] = imageFiles.map(file => ({
            id: uuidv4(),
            type: 'image',
            source: 'new',
            file: file,
            previewUrl: URL.createObjectURL(file),
        }));
        setDescriptionItems(prev => [...prev, ...newItems]);
    };

    const addBreak = (index: number) => {
        const newBreak: DescriptionItem = {
            id: uuidv4(),
            type: 'break',
            source: 'new',
            previewUrl: ''
        };
        const newItems = [...descriptionItems];
        newItems.splice(index + 1, 0, newBreak);
        setDescriptionItems(newItems);
    };

    const removeItem = (id: string) => {
        setDescriptionItems(prev => prev.filter(item => item.id !== id));
    };

    const handleDropOnItem = (targetId: string) => {
        if (draggedId === null || draggedId === targetId) return;
        const newItems = [...descriptionItems];
        const draggedIndex = newItems.findIndex(item => item.id === draggedId);
        const targetIndex = newItems.findIndex(item => item.id === targetId);

        if (draggedIndex > -1 && targetIndex > -1) {
            const [draggedItem] = newItems.splice(draggedIndex, 1);
            newItems.splice(targetIndex, 0, draggedItem);
            setDescriptionItems(newItems);
        }

        setDraggedId(null);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!title || (!mainImageFile && !mainImagePreview) || isPending) return;

        const formData = new FormData();
        formData.append('title', title);

        const commonCallbacks = {
            onSuccess: () => {
                alert(isUpdateMode ? '프로젝트가 수정되었습니다.' : '프로젝트가 생성되었습니다.');
                onClose();
            },
            onError: (error: Error) => {
                alert(`오류: ${error.message}`);
            }
        };

        if (isUpdateMode && project) {
            if (mainImageFile) formData.append('image', mainImageFile);

            const simplifiedDescription = descriptionItems.map(item => ({
                itemType: item.type,
                src: item.source === 'new' ? `new_image_${item.id}` : (item.type === 'image' ? item.previewUrl : undefined)
            }));
            formData.append('description', JSON.stringify(simplifiedDescription));

            descriptionItems.forEach(item => {
                if (item.source === 'new' && item.file) {
                    formData.append(`new_image_${item.id}`, item.file);
                }
            });

            updateProject({ id: `${project._id}`, formData }, commonCallbacks);

        } else {
            if (mainImageFile) formData.append('image', mainImageFile);

            descriptionItems.forEach((item, index) => {
                formData.append(`description[${index}][itemType]`, item.type);
                if (item.type === 'image' && item.file) {
                    formData.append(`description_image_${index}`, item.file);
                }
            });

            createProject(formData, commonCallbacks);
        }
    };

    return (
        <div className="border border-gray-200 sm:p-4 p-3 overflow-auto">
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
                <main className="space-y-6">
                    {/* 프로젝트 제목 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">프로젝트 제목 *</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2" required />
                    </div>

                    {/* 대표 이미지 */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">대표 이미지 *</label>
                        <div
                            onClick={() => document.getElementById('main-image-input')?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); handleMainImageChange(e.dataTransfer.files); }}
                            className="relative border-2 border-dashed rounded-md w-full h-48 flex items-center justify-center cursor-pointer text-gray-500 hover:bg-gray-50"
                        >
                            {mainImagePreview ? (
                                <Image src={mainImagePreview} alt="대표 이미지 미리보기" fill className="object-contain p-2" />
                            ) : (
                                <span>이미지를 드래그하거나 클릭하여 업로드</span>
                            )}
                        </div>
                        <input id="main-image-input" type="file" accept="image/*" onChange={(e) => handleMainImageChange(e.target.files)} className="hidden" />
                    </div>

                    {/* 상세 설명 (이미지 및 줄바꿈) */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">상세 설명 (드래그하여 순서 변경)</label>
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => { e.preventDefault(); handleDescriptionFiles(Array.from(e.dataTransfer.files)); }}
                            className="border-2 border-dashed rounded-md p-4 flex flex-row flex-wrap gap-4 overflow-x-auto"
                        >
                            {descriptionItems.map((item, index) => (
                                <div 
                                    key={item.id}        
                                    draggable
                                    onDragStart={() => setDraggedId(item.id)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDropOnItem(item.id)}
                                    // ✅ [수정] 아이템 유형에 따라 너비(w-*)와 패딩(p-*)을 다르게 적용합니다.
                                    className={`group relative rounded-md transition-opacity h-48 flex flex-col flex-shrink-0 cursor-grab
                                                ${item.type === 'image' 
                                                    ? 'w-48 p-2 bg-gray-100'             // 이미지: 너비 48, 패딩 2
                                                    : 'w-auto justify-center px-1'}      // 줄바꿈: 자동 너비, 좌우 패딩 1
                                                ${draggedId === item.id ? 'opacity-30' : ''}`}
                                >
                                    <button 
                                        type="button" 
                                        onClick={() => removeItem(item.id)} 
                                        className="absolute -right-2 -top-2 z-10 h-6 w-6 rounded-full opacity-100 sm:opacity-0 bg-red-600 text-white text-xs group-hover:opacity-100 ease-in-out transition-all"
                                    >
                                        &times;
                                    </button>

                                    <div className="flex-grow w-full flex items-center justify-center overflow-hidden">
                                        {item.type === 'image' ? (
                                            <Image src={item.previewUrl!} alt="설명 이미지" width={300} height={400} className="w-auto h-auto max-w-full max-h-full object-contain" />
                                        ) : (
                                            // ✅ [수정] '줄바꿈'을 세로선과 세로 텍스트 형태로 변경하여 공간 효율을 높입니다.
                                                <div className="h-full flex items-center justify-center border-blue-300 border-dashed border-l-2 border-r-2 px-3">
                                                <span className="text-blue-500 text-sm [writing-mode:vertical-rl]">
                                                    줄바꿈
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-center mt-2 flex-shrink-0">
                                        <button 
                                            type="button" 
                                            onClick={() => addBreak(index)} 
                                            className="text-xs text-blue-600 hover:underline"
                                        >
                                            [+] 줄바꿈 추가
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {descriptionItems.length === 0 && (
                                // 🎨 추가/변경: placeholder가 flex 컨테이너 중앙에 오도록 w-full div로 감싸기
                                <div className="w-full flex justify-center items-center">
                                    <p className="text-center text-gray-400 py-10">이미지를 드래그하거나 아래 버튼으로 추가</p>
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => descriptionFileInputRef.current?.click()}
                            className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded-md text-sm hover:bg-gray-300"
                        >
                            이미지 추가하기
                        </button>
                        <input
                            ref={descriptionFileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleDescriptionFiles(Array.from(e.target.files || []))}
                            className="hidden"
                        />
                    </div>
                </main>
                <footer className="flex justify-end gap-3 border-t pt-4 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-md hover:bg-gray-50">
                        취소
                    </button>
                    <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-gray-800 border rounded-md hover:bg-gray-700 disabled:bg-gray-400">
                        {isPending ? '저장 중...' : (isUpdateMode ? '변경사항 저장' : '프로젝트 생성')}
                    </button>
                </footer>
            </form>
        </div>
    );
};

export default ProjectForm;