"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Product, Season } from "@/src/entities/type/interfaces";
import { uploadImagesToServer } from "@/src/shared/lib/uploadToR2";
import {
    usePostProductMutation,
    useUpdateProductMutation,
} from "@/src/shared/hooks/react-query/useProductQuery";
import useProduct from "@/src/shared/hooks/useProduct";
import { useSetAtom } from "jotai";
import { loadingAtom } from "@/src/shared/lib/atom";
import { useSeasonQuery } from "@/src/shared/hooks/react-query/useSeasonQuery";
import Modal from "./Modal";

// ProductVariant 타입 정의 - 색상 옵션만
interface ProductVariant {
    id: string;
    optionNumber: string;
    colorName: string;
    optionPrice: number;
    stockQuantity: number;
    salesStatus: '판매중' | '품절' | '판매중지';
    managementCode: string;
    isModelWearing: boolean;
    isActive: boolean;
}

// 새 옵션 타입
type NewVariantType = Omit<ProductVariant, 'id' | 'optionNumber'>;

// 이미지 데이터 타입
interface ImageData {
    previews: string[];
    files: File[];
    existingUrls: string[];
}

interface UpdateProductModalProps {
    onClose: () => void;
    product?: Product;
    mode?: "create" | "update";
}

const UpdateProductModal: React.FC<UpdateProductModalProps> = ({
    onClose,
    product,
    mode = "create",
}) => {
    // 기존 상태들
    const [imageData, setImageData] = useState<ImageData>({
        previews: [],
        files: [],
        existingUrls: [],
    });

    const [descriptionImageData, setDescriptionImageData] = useState<ImageData>({
        previews: [],
        files: [],
        existingUrls: [],
    });

    const [hasImageChanges, setHasImageChanges] = useState<boolean>(false);
    const [hasDescriptionImageChanges, setHasDescriptionImageChanges] = useState<boolean>(false);

    // 새로 추가된 variants 상태들 (색상 옵션만)
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [newVariant, setNewVariant] = useState<NewVariantType>({
        colorName: '',
        optionPrice: 0,
        stockQuantity: 0,
        salesStatus: '판매중',
        managementCode: '',
        isModelWearing: false,
        isActive: true
    });

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const descriptionFileInputRef = useRef<HTMLInputElement>(null);

    // Hooks
    const { formData, setFormData } = useProduct();
    const { data: season, isLoading, error } = useSeasonQuery();
    const { mutateAsync: createProduct } = usePostProductMutation();
    const { mutateAsync: updateProduct } = useUpdateProductMutation();
    const setLoading = useSetAtom(loadingAtom);

    // 옵션번호 생성 함수
    const generateOptionNumber = (): string => {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `502670${timestamp}${random}`;
    };

    // 옵션 추가
    const addVariant = (): void => {
        if (!newVariant.colorName.trim()) {
            alert('색상명은 필수입니다.');
            return;
        }

        // 중복 체크 (색상만)
        const isDuplicate = variants.some((v: ProductVariant) => 
            v.colorName.toLowerCase() === newVariant.colorName.toLowerCase()
        );
        
        if (isDuplicate) {
            alert('같은 색상이 이미 존재합니다.');
            return;
        }

        const variant: ProductVariant = {
            ...newVariant,
            id: Date.now().toString(),
            optionNumber: generateOptionNumber(),
            colorName: newVariant.colorName.trim(),
        };

        setVariants(prev => [...prev, variant]);
        
        // 폼 초기화
        setNewVariant(prev => ({
            ...prev,
            colorName: '',
            optionPrice: 0,
            stockQuantity: 0,
            salesStatus: '판매중',
            managementCode: '',
            isModelWearing: false,
            isActive: true
        }));
    };

    // 옵션 제거
    const removeVariant = (id: string): void => {
        if (confirm('이 옵션을 삭제하시겠습니까?')) {
            setVariants(prev => prev.filter((v: ProductVariant) => v.id !== id));
        }
    };

    // 옵션 수정
    const editVariant = (variant: ProductVariant): void => {
        setNewVariant({
            colorName: variant.colorName,
            optionPrice: variant.optionPrice,
            stockQuantity: variant.stockQuantity,
            salesStatus: variant.salesStatus,
            managementCode: variant.managementCode,
            isModelWearing: variant.isModelWearing,
            isActive: variant.isActive
        });
        removeVariant(variant.id);
    };

    // 옵션 활성/비활성 토글
    const toggleVariantActive = (id: string): void => {
        setVariants(prev => 
            prev.map((v: ProductVariant) => 
                v.id === id ? { ...v, isActive: !v.isActive } : v
            )
        );
    };

    // 초기화 함수
    const resetAll = (): void => {
        if (mode === "update" && product) {
            // 업데이트 모드: 원본 데이터로 리셋
            setFormData({
                title: product.title,
                description: product.description,
                price: product.price,
                discount: product.discount || "",
                image: product.image,
                colors: product.colors,
                seasonName: product.seasonName,
                size: product.size,
                quantity: product.quantity,
            });

            setImageData({
                previews: product.image || [],
                files: [],
                existingUrls: product.image || [],
            });

            const descriptionImages = Array.isArray(product.description.images)
                ? product.description.images
                : product.description.images
                  ? [product.description.images]
                  : [];

            setDescriptionImageData({
                previews: descriptionImages,
                files: [],
                existingUrls: descriptionImages,
            });

            // 기존 variants 재생성 (색상만)
            if (product.colors && product.colors.length > 0) {
                const existingVariants: ProductVariant[] = [];
                const baseQuantity = Math.floor(parseInt(product.quantity || "0") / product.colors.length);
                
                product.colors.forEach((color, colorIndex) => {
                    existingVariants.push({
                        id: `${color}-${colorIndex}`,
                        optionNumber: generateOptionNumber(),
                        colorName: color,
                        optionPrice: 0,
                        stockQuantity: baseQuantity,
                        salesStatus: '판매중',
                        managementCode: '',
                        isModelWearing: false,
                        isActive: true
                    });
                });
                setVariants(existingVariants);
            }
        } else {
            // 생성 모드: 빈 값으로 리셋
            setFormData({
                title: { kr: "", eg: "" },
                description: { images: [], text: "", detail: "" },
                price: "",
                discount: "",
                image: [],
                colors: [],
                seasonName: "",
                size: [],
                quantity: "",
            });

            setImageData({
                previews: [],
                files: [],
                existingUrls: [],
            });

            setDescriptionImageData({
                previews: [],
                files: [],
                existingUrls: [],
            });

            setVariants([]);
        }

        setNewVariant({
            colorName: '',
            optionPrice: 0,
            stockQuantity: 0,
            salesStatus: '판매중',
            managementCode: '',
            isModelWearing: false,
            isActive: true
        });

        setHasImageChanges(false);
        setHasDescriptionImageChanges(false);
    };

    // 기존 상품 데이터로 초기화
    useEffect(() => {
        if (mode === "update" && product) {
            setFormData({
                title: product.title,
                description: product.description,
                price: product.price,
                discount: product.discount || "",
                image: product.image,
                colors: product.colors,
                seasonName: product.seasonName,
                size: product.size,
                quantity: product.quantity,
            });

            // 기존 이미지 데이터 설정
            setImageData({
                previews: product.image || [],
                files: [],
                existingUrls: product.image || [],
            });

            // 기존 설명 이미지 데이터 설정
            const descriptionImages = Array.isArray(product.description.images)
                ? product.description.images
                : product.description.images
                  ? [product.description.images]
                  : [];

            setDescriptionImageData({
                previews: descriptionImages,
                files: [],
                existingUrls: descriptionImages,
            });

            // 기존 상품의 색상으로 variants 생성
            if (product.colors && product.colors.length > 0) {
                const existingVariants: ProductVariant[] = [];
                const baseQuantity = Math.floor(parseInt(product.quantity || "0") / product.colors.length);
                
                product.colors.forEach((color, colorIndex) => {
                    existingVariants.push({
                        id: `${color}-${colorIndex}`,
                        optionNumber: generateOptionNumber(),
                        colorName: color,
                        optionPrice: 0,
                        stockQuantity: baseQuantity,
                        salesStatus: '판매중',
                        managementCode: '',
                        isModelWearing: false,
                        isActive: true
                    });
                });
                setVariants(existingVariants);
            }
        } else {
            resetAll();
        }
    }, [mode, product]); // setFormData 의존성 제거

    // Input 변경 핸들러
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ): void => {
        const { name, value } = e.target;

        if (name === "titleKr") {
            setFormData((prev) => ({
                ...prev,
                title: { ...prev.title, kr: value },
            }));
        } else if (name === "titleEg") {
            setFormData((prev) => ({
                ...prev,
                title: { ...prev.title, eg: value },
            }));
        } else if (name === "descriptionText") {
            setFormData((prev) => ({
                ...prev,
                description: { ...prev.description, text: value },
            }));
        } else if (name === "descriptionDetailText") {
            setFormData((prev) => ({
                ...prev,
                description: { ...prev.description, detail: value },
            }));
        } else if (name === "price" || name === "discount" || name === "quantity") {
            const numericValue = value.replace(/,/g, "");
            if (!/^\d*$/.test(numericValue)) return;

            setFormData((prev) => ({
                ...prev,
                [name]: numericValue,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // 이미지 업로드 핸들러
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
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

    // 설명 이미지 업로드 핸들러
    const handleDescriptionImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
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

    // 이미지 제거 핸들러
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

    // 설명 이미지 제거 핸들러
    const removeDescriptionImage = (index: number): void => {
        const newPreviews = [...descriptionImageData.previews];
        const newFiles = [...descriptionImageData.files];
        const newExistingUrls = [...descriptionImageData.existingUrls];

        const isExistingImage = index < descriptionImageData.existingUrls.length;

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

    // 폼 검증
    const validateForm = (): boolean => {
        const validations = [
            {
                condition: imageData.previews.length !== 3,
                message: "이미지를 정확히 3개 유지해주세요.",
            },
            {
                condition: !formData.title.kr || !formData.title.eg,
                message: "상품명(한글, 영어)을 모두 입력해주세요.",
            },
            {
                condition: !formData.description.text,
                message: "설명을 적어주세요.",
            },
            {
                condition: descriptionImageData.previews.length === 0,
                message: "설명 이미지를 최소 1개 이상 선택해주세요.",
            },
            {
                condition: !formData.price,
                message: "가격을 책정해주세요.",
            },
            {
                condition: variants.length === 0,
                message: "최소 1개 이상의 색상 옵션을 등록해주세요.",
            },
        ];

        for (const { condition, message } of validations) {
            if (condition) {
                alert(message);
                return false;
            }
        }
        return true;
    };

    // 폼 제출 핸들러
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        try {
            const confirmMessage = mode === "update"
                ? "상품을 업데이트 하시겠습니까?"
                : "상품을 등록하시겠습니까?";

            if (validateForm() && confirm(confirmMessage)) {
                setLoading(true);

                let uploadedImageUrls: string[] = imageData.existingUrls;
                let uploadedDescriptionImageUrls: string[] = descriptionImageData.existingUrls;

                // 이미지 업로드 처리
                if (hasImageChanges && imageData.files.length > 0) {
                    const newImageUrls = await uploadImagesToServer(imageData.files);
                    if (newImageUrls) {
                        uploadedImageUrls = [...imageData.existingUrls, ...newImageUrls];
                    }
                } else if (!hasImageChanges) {
                    uploadedImageUrls = formData.image;
                }

                // 설명 이미지 업로드 처리
                if (hasDescriptionImageChanges && descriptionImageData.files.length > 0) {
                    const newDescriptionImageUrls = await uploadImagesToServer(descriptionImageData.files);
                    if (newDescriptionImageUrls) {
                        uploadedDescriptionImageUrls = [...descriptionImageData.existingUrls, ...newDescriptionImageUrls];
                    }
                }

                // variants에서 colors 추출, size는 기존 유지
                const uniqueColors = [...new Set(variants.map((v: ProductVariant) => v.colorName))];
                const totalStock = variants.reduce((sum: number, v: ProductVariant) => sum + v.stockQuantity, 0);

                const finalData: Product = {
                    ...formData,
                    image: uploadedImageUrls,
                    description: {
                        images: uploadedDescriptionImageUrls,
                        text: formData.description.text,
                        detail: formData.description.detail,
                    },
                    colors: uniqueColors,
                    size: formData.size, // 기존 사이즈 유지
                    quantity: totalStock.toString(),
                };

                if (mode === "update" && product?._id) {
                    finalData._id = product._id;
                }

                if (mode === "update") {
                    await updateProduct(finalData);
                } else {
                    await createProduct(finalData);
                }

                onClose();
            }
        } catch (err) {
            console.error(err);
            const errorMessage = mode === "update"
                ? "상품 업데이트 중 오류가 발생했습니다."
                : "상품 등록 중 오류가 발생했습니다.";
            alert(errorMessage);
            setLoading(false);
        }
    };

    // 로딩 상태
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="rounded-md bg-white p-8">
                    <div className="text-center">로딩 중...</div>
                </div>
            </div>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="rounded-md bg-white p-8">
                    <div className="text-center text-red-600">
                        데이터를 불러오는데 실패했습니다.
                    </div>
                    <button
                        onClick={() => confirm("작성을 취소하시겠습니까?") && onClose()}
                        className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-white"
                    >
                        닫기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Modal onClose={() => confirm("작성을 취소하시겠습니까?") && onClose()}>
            <h1 className="mb-6 text-center font-pretendard text-2xl font-semibold text-gray-800">
                {mode === "update" ? "상품 수정" : "상품 등록"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* 이미지 업로드 섹션 */}
                <div className="rounded-md bg-gray-50 p-4">
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                        상품 이미지 (필수 3개)
                    </label>

                    <div className="mb-4 grid grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="relative flex aspect-square items-center justify-center rounded-md border-2 border-dashed border-gray-300"
                            >
                                {imageData.previews[index] ? (
                                    <>
                                        <Image
                                            src={imageData.previews[index]}
                                            alt={`Preview ${index + 1}`}
                                            width={500}
                                            height={500}
                                            className="rounded-md object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center text-gray-400">
                                        <div className="mb-2 text-2xl">+</div>
                                        <div className="text-xs">이미지 {index + 1}</div>
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
                        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        현재 {imageData.previews.length}/3개
                        {mode === "update" && hasImageChanges && " (변경됨)"}
                    </p>
                </div>

                {/* 상품명 입력 */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            상품명 (한글) *
                        </label>
                        <input
                            type="text"
                            name="titleKr"
                            value={formData.title.kr}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                            placeholder="한글 상품명을 입력하세요"
                            required
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            상품명 (영어) *
                        </label>
                        <input
                            type="text"
                            name="titleEg"
                            value={formData.title.eg}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                            placeholder="English product name"
                            required
                        />
                    </div>
                </div>

                {/* 상품 설명 */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        상품 설명 *
                    </label>
                    <textarea
                        name="descriptionText"
                        value={formData.description.text}
                        onChange={handleInputChange}
                        className="mb-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                        placeholder="상품 설명을 입력하세요 (최대 500자)"
                        rows={3}
                        maxLength={500}
                    />

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        추가 상세설명 *
                    </label>
                    <textarea
                        name="descriptionDetailText"
                        value={formData.description.detail}
                        onChange={handleInputChange}
                        className="mb-4 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                        placeholder="상품 설명을 입력하세요 (최대 150자)"
                        rows={3}
                        maxLength={150}
                    />

                    {/* 설명 이미지 섹션 */}
                    <div className="mt-4 rounded-md border-2 border-dashed bg-gray-50 p-4">
                        <label className="mb-3 block text-sm font-medium text-gray-700">
                            상품 설명 이미지 *
                            {hasDescriptionImageChanges && " (변경됨)"}
                        </label>

                        {descriptionImageData.previews.length > 0 && (
                            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                                {descriptionImageData.previews.map((preview, index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-square overflow-visible rounded-md border border-gray-200"
                                    >
                                        <Image
                                            src={preview}
                                            alt={`설명 이미지 ${index + 1}`}
                                            width={500}
                                            height={500}
                                            className="object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeDescriptionImage(index)}
                                            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="rounded-md border-gray-300 p-4">
                            <div className="text-center">
                                <div className="mb-2 text-sm text-gray-600">
                                    설명 이미지를 업로드하세요 (세로로 연결될 이미지들)
                                </div>
                                <input
                                    ref={descriptionFileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleDescriptionImageUpload}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
                                />
                                <p className="mt-2 text-xs text-gray-500">
                                    JPG, PNG, GIF 파일을 지원합니다. 현재 {descriptionImageData.previews.length}개
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 시즌, 가격, 할인율, 수량 */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">시즌</label>
                        <select
                            name="seasonName"
                            value={formData.seasonName}
                            onChange={handleInputChange}
                            className="h-[42px] w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                        >
                            <option value="">시즌 선택</option>
                            {season?.map((item: Season, index) => (
                                <option key={index} value={item.title}>
                                    {item.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">가격 (원) *</label>
                        <input
                            type="text"
                            name="price"
                            value={formData.price ? Number(formData.price).toLocaleString("ko-KR") : ""}
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">할인율 (%)</label>
                        <input
                            type="text"
                            name="discount"
                            value={formData.discount}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || (/^\d+$/.test(value) && parseInt(value) <= 100)) {
                                    handleInputChange(e);
                                }
                            }}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                            placeholder="100 이하만 가능"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">총 수량 (자동계산)</label>
                        <input
                            type="text"
                            value={variants.reduce((sum, v) => sum + v.stockQuantity, 0).toString()}
                            readOnly
                            className="w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-100 text-gray-600"
                            placeholder="옵션별 재고 합계"
                        />
                    </div>
                </div>

                {/* 색상 옵션 관리 */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                        색상 옵션 관리 *
                    </label>
                    
                    {/* 옵션 추가 폼 */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">새 색상 옵션 추가</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">색상명</label>
                                <input
                                    type="text"
                                    value={newVariant.colorName}
                                    onChange={(e) => setNewVariant({...newVariant, colorName: e.target.value})}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="예: 블랙"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">재고수량</label>
                                <input
                                    type="number"
                                    value={newVariant.stockQuantity}
                                    onChange={(e) => setNewVariant({...newVariant, stockQuantity: parseInt(e.target.value) || 0})}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    min="0"
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">옵션가격</label>
                                <input
                                    type="number"
                                    value={newVariant.optionPrice}
                                    onChange={(e) => setNewVariant({...newVariant, optionPrice: parseInt(e.target.value) || 0})}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="0 (추가비용)"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">판매상태</label>
                                <select
                                    value={newVariant.salesStatus}
                                    onChange={(e) => setNewVariant({...newVariant, salesStatus: e.target.value as ProductVariant['salesStatus']})}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="판매중">판매중</option>
                                    <option value="품절">품절</option>
                                    <option value="판매중지">판매중지</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">관리코드</label>
                                <input
                                    type="text"
                                    value={newVariant.managementCode}
                                    onChange={(e) => setNewVariant({...newVariant, managementCode: e.target.value})}
                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="선택사항"
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <label className="flex items-center gap-2 text-xs">
                                    <input
                                        type="checkbox"
                                        checked={newVariant.isModelWearing}
                                        onChange={(e) => setNewVariant({...newVariant, isModelWearing: e.target.checked})}
                                        className="rounded"
                                    />
                                    모델착용
                                </label>
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                                >
                                    추가
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 옵션 목록 테이블 */}
                    {variants.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                <h4 className="text-sm font-medium text-gray-900">
                                    등록된 색상 옵션 ({variants.length}개)
                                </h4>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-gray-50">
                                        <tr className="border-b border-gray-200">
                                            <th className="px-3 py-2 text-left font-medium text-gray-700">옵션번호</th>
                                            <th className="px-3 py-2 text-left font-medium text-gray-700">색상</th>
                                            <th className="px-3 py-2 text-center font-medium text-gray-700">옵션가</th>
                                            <th className="px-3 py-2 text-center font-medium text-gray-700">재고수량</th>
                                            <th className="px-3 py-2 text-center font-medium text-gray-700">판매상태</th>
                                            <th className="px-3 py-2 text-center font-medium text-gray-700">관리코드</th>
                                            <th className="px-3 py-2 text-center font-medium text-gray-700">모델착용</th>
                                            <th className="px-3 py-2 text-center font-medium text-gray-700">사용여부</th>
                                            <th className="px-3 py-2 text-center font-medium text-gray-700">관리</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {variants.map((variant) => (
                                            <tr key={variant.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="px-3 py-2 font-mono text-xs text-gray-900">
                                                    {variant.optionNumber}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span className="text-xs font-medium">{variant.colorName}</span>
                                                </td>
                                                <td className="px-3 py-2 text-center text-xs">
                                                    {variant.optionPrice === 0 ? '기본가' : `+${variant.optionPrice.toLocaleString()}원`}
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className={`text-xs font-medium ${
                                                        variant.stockQuantity === 0 ? 'text-red-600' :
                                                        variant.stockQuantity < 10 ? 'text-orange-600' : 'text-gray-900'
                                                    }`}>
                                                        {variant.stockQuantity}개
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                        variant.salesStatus === '판매중' ? 'bg-green-100 text-green-800' :
                                                        variant.salesStatus === '품절' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {variant.salesStatus}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-center text-xs text-gray-600">
                                                    {variant.managementCode || '-'}
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <span className={`inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full ${
                                                        variant.isModelWearing ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {variant.isModelWearing ? 'Y' : 'N'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleVariantActive(variant.id)}
                                                        className={`inline-flex items-center justify-center w-6 h-6 rounded transition-colors ${
                                                            variant.isActive 
                                                                ? 'text-green-600 hover:bg-green-50' 
                                                                : 'text-gray-400 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {variant.isActive ? (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => editVariant(variant)}
                                                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="수정"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeVariant(variant.id)}
                                                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="삭제"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                    <span>총 {variants.length}개 색상 옵션</span>
                                    <div className="flex items-center gap-4">
                                        <span>활성: {variants.filter(v => v.isActive).length}개</span>
                                        <span>총 재고: {variants.reduce((sum, v) => sum + v.stockQuantity, 0)}개</span>
                                        <span>모델착용: {variants.filter(v => v.isModelWearing).length}개</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {variants.length === 0 && (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                            <div className="text-sm">아직 등록된 색상 옵션이 없습니다.</div>
                            <div className="text-xs mt-1">위 폼을 사용하여 색상 옵션을 추가해주세요.</div>
                        </div>
                    )}
                </div>

                {/* 버튼 영역 */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => confirm("작성을 취소하시겠습니까?") && onClose()}
                        className="flex-1 rounded-md border border-gray-300 py-2 text-gray-700 hover:bg-gray-50"
                    >
                        닫기
                    </button>
                    {mode === "create" && (
                        <button
                            type="button"
                            onClick={() => {
                                if (confirm("정말 초기값으로 되돌리시겠습니까?")) {
                                    resetAll();
                                }
                            }}
                            className="flex-1 rounded-md border border-gray-300 bg-red-500 py-2 text-white hover:bg-red-400"
                        >
                            초기화
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex-1 rounded-md bg-gray-800 py-2 text-white hover:bg-gray-700"
                    >
                        {mode === "update" ? "상품 수정" : "상품 등록"}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default UpdateProductModal;