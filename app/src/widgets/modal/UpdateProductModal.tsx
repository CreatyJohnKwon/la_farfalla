"use client";

import { motion } from "framer-motion";
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

const UpdateProductModal = ({
    onClose,
    product, // 기존 상품 데이터 (업데이트 시)
    mode = "create", // "create" | "update"
}: {
    onClose: () => void;
    product?: Product;
    mode?: "create" | "update";
}) => {
    const [colorInput, setColorInput] = useState<string>("");
    const [sizeInput, setSizeInput] = useState<string>("");
    const [imageData, setImageData] = useState<{
        previews: string[];
        files: File[];
        existingUrls: string[];
    }>({
        previews: [],
        files: [],
        existingUrls: [],
    });

    // 설명 이미지 데이터 상태 추가
    const [descriptionImageData, setDescriptionImageData] = useState<{
        previews: string[];
        files: File[];
        existingUrls: string[];
    }>({
        previews: [],
        files: [],
        existingUrls: [],
    });

    const [hasImageChanges, setHasImageChanges] = useState(false);
    const [hasDescriptionImageChanges, setHasDescriptionImageChanges] =
        useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const descriptionFileInputRef = useRef<HTMLInputElement>(null);
    const { formData, setFormData } = useProduct();

    const { data: season, isLoading, error } = useSeasonQuery();
    const { mutateAsync: createProduct } = usePostProductMutation();
    const { mutateAsync: updateProduct } = useUpdateProductMutation();
    const setLoading = useSetAtom(loadingAtom);

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

    // 기존 상품 데이터로 초기화할 때 (useEffect 내부)
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
        } else {
            resetAll();
        }
    }, [mode, product, setFormData]);

    // 수정된 resetAll 함수
    const resetAll = () => {
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
        }

        setColorInput("");
        setSizeInput("");
        setHasImageChanges(false);
        setHasDescriptionImageChanges(false);
    };

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => {
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
        } else if (name === "price" || name === "discount") {
            // 쉼표 제거하고 숫자만 허용
            const numericValue = value.replace(/,/g, "");
            if (!/^\d*$/.test(numericValue)) return; // 숫자만 입력 가능

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

    // 수정된 handleImageUpload 함수
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        // 현재 총 이미지 개수 계산
        const currentImageCount = imageData.previews.length;

        if (currentImageCount + files.length > 3) {
            alert("이미지는 최대 3개까지만 업로드할 수 있습니다.");
            return;
        }

        // 새로운 파일들을 추가
        const newFiles = [...imageData.files, ...files];
        setHasImageChanges(true);

        // 미리보기 생성
        const newPreviews = [...imageData.previews];
        let processedCount = 0;

        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    newPreviews.push(e.target.result as string);
                    processedCount++;

                    // 모든 파일이 처리되면 상태 업데이트
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

    // 설명 이미지 업로드 핸들러 추가
    const handleDescriptionImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const files = Array.from(e.target.files || []);

        // 새로운 파일들을 추가
        const newFiles = [...descriptionImageData.files, ...files];
        setHasDescriptionImageChanges(true);

        // 미리보기 생성
        const newPreviews = [...descriptionImageData.previews];
        let processedCount = 0;

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    newPreviews.push(e.target.result as string);
                    processedCount++;

                    // 모든 파일이 처리되면 상태 업데이트
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

    // 수정된 removeImage 함수
    const removeImage = (index: number) => {
        const newPreviews = [...imageData.previews];
        const newFiles = [...imageData.files];
        const newExistingUrls = [...imageData.existingUrls];

        // 제거할 이미지가 기존 이미지인지 새로 추가된 이미지인지 확인
        const isExistingImage = index < imageData.existingUrls.length;

        if (isExistingImage) {
            // 기존 이미지 제거
            newExistingUrls.splice(index, 1);
            newPreviews.splice(index, 1);
        } else {
            // 새로 추가된 이미지 제거
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

    // 설명 이미지 제거 함수 추가
    const removeDescriptionImage = (index: number) => {
        const newPreviews = [...descriptionImageData.previews];
        const newFiles = [...descriptionImageData.files];
        const newExistingUrls = [...descriptionImageData.existingUrls];

        // 제거할 이미지가 기존 이미지인지 새로 추가된 이미지인지 확인
        const isExistingImage =
            index < descriptionImageData.existingUrls.length;

        if (isExistingImage) {
            // 기존 이미지 제거
            newExistingUrls.splice(index, 1);
            newPreviews.splice(index, 1);
        } else {
            // 새로 추가된 이미지 제거
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

    const addColor = () => {
        if (colorInput.trim() && !formData.colors.includes(colorInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                colors: [...prev.colors, colorInput.trim()],
            }));
            setColorInput("");
        }
    };

    const removeColor = (color: string) => {
        setFormData((prev) => ({
            ...prev,
            colors: prev.colors.filter((c) => c !== color),
        }));
    };

    const addSize = () => {
        if (sizeInput.trim() && !formData.size.includes(sizeInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                size: [...prev.size, sizeInput.trim()],
            }));
            setSizeInput("");
        }
    };

    const removeSize = (size: string) => {
        setFormData((prev) => ({
            ...prev,
            size: prev.size.filter((s) => s !== size),
        }));
    };

    const validateForm = () => {
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
                condition:
                    mode === "create" &&
                    descriptionImageData.previews.length === 0,
                message: "설명 이미지를 최소 1개 이상 선택해주세요.",
            },
            {
                condition:
                    mode === "update" &&
                    descriptionImageData.previews.length === 0,
                message: "설명 이미지를 최소 1개 이상 선택해주세요.",
            },
            {
                condition: !formData.price,
                message: "가격을 책정해주세요.",
            },
            {
                condition: !formData.colors || formData.colors.length === 0,
                message: "색상을 선택해주세요.",
            },
            {
                condition: !formData.size || formData.size.length === 0,
                message: "사이즈를 선택해주세요.",
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const confirmMessage =
                mode === "update"
                    ? "상품을 업데이트 하시겠습니까?"
                    : "상품을 등록하시겠습니까?";

            if (validateForm() && confirm(confirmMessage)) {
                setLoading(true);

                let uploadedImageUrls: string[] = imageData.existingUrls;

                // 이미지가 변경된 경우 처리
                if (hasImageChanges) {
                    // 새로 추가된 파일이 있는 경우 업로드
                    if (imageData.files.length > 0) {
                        const newImageUrls = await uploadImagesToServer(
                            imageData.files,
                        );
                        if (newImageUrls) {
                            // 기존 유지된 이미지 URL과 새로 업로드된 이미지 URL을 합침
                            uploadedImageUrls = [
                                ...imageData.existingUrls,
                                ...newImageUrls,
                            ];
                        }
                    } else {
                        // 새로 추가된 파일은 없지만 기존 이미지가 삭제된 경우
                        // (기존 이미지만 유지)
                        uploadedImageUrls = imageData.existingUrls;
                    }
                } else {
                    // 이미지 변경이 없는 경우 기존 이미지 유지
                    uploadedImageUrls = formData.image;
                }

                // 설명 이미지 처리
                let uploadedDescriptionImageUrls: string[] =
                    descriptionImageData.existingUrls;
                if (hasDescriptionImageChanges) {
                    // 새로 추가된 파일이 있는 경우 업로드
                    if (descriptionImageData.files.length > 0) {
                        const newDescriptionImageUrls =
                            await uploadImagesToServer(
                                descriptionImageData.files,
                            );
                        if (newDescriptionImageUrls) {
                            uploadedDescriptionImageUrls = [
                                ...descriptionImageData.existingUrls,
                                ...newDescriptionImageUrls,
                            ];
                        }
                    } else {
                        // 새로 추가된 파일은 없지만 기존 이미지가 삭제된 경우
                        uploadedDescriptionImageUrls =
                            descriptionImageData.existingUrls;
                    }
                }

                const finalData: Product = {
                    ...formData,
                    image: uploadedImageUrls,
                    description: {
                        images: uploadedDescriptionImageUrls,
                        text: formData.description.text,
                        detail: formData.description.detail,
                    },
                };

                // 업데이트 모드인 경우 ID 포함
                if (mode === "update" && product?._id) finalData._id = product._id;

                if (mode === "update") await updateProduct(finalData);
                else await createProduct(finalData);

                onClose();
            }
        } catch (err) {
            console.error(err);
            const errorMessage =
                mode === "update"
                    ? "상품 업데이트 중 오류가 발생했습니다."
                    : "상품 등록 중 오류가 발생했습니다.";
            alert(errorMessage);
            setLoading(false);
        }
    };

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
                                        <div className="text-xs">
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
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none mb-2"
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
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none mb-4"
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

                        {/* 설명 이미지 미리보기 */}
                        {descriptionImageData.previews.length > 0 && (
                            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
                                {descriptionImageData.previews.map(
                                    (preview, index) => (
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
                                                onClick={() =>
                                                    removeDescriptionImage(
                                                        index,
                                                    )
                                                }
                                                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ),
                                )}
                            </div>
                        )}

                        {/* 설명 이미지 업로드 버튼 */}
                        <div className="rounded-md border-gray-300 p-4">
                            <div className="text-center">
                                <div className="mb-2 text-sm text-gray-600">
                                    설명 이미지를 업로드하세요 (세로로 연결될
                                    이미지들)
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
                                    JPG, PNG, GIF 파일을 지원합니다. 현재{" "}
                                    {descriptionImageData.previews.length}개
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 카테고리, 시즌, 가격, 할인율 */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            시즌
                        </label>
                        <select
                            name="seasonName"
                            value={formData.seasonName}
                            onChange={handleInputChange}
                            className="h-[42px] w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                        >
                            <option key={"default"} value="">
                                시즌 선택
                            </option>
                            {season &&
                                season.map((item: Season, index) => (
                                    <option key={index} value={item.title}>
                                        {item.title}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            가격 (원) *
                        </label>
                        <input
                            type="text"
                            name="price"
                            value={
                                formData.price
                                    ? Number(formData.price).toLocaleString(
                                          "ko-KR",
                                      )
                                    : ""
                            }
                            onChange={handleInputChange}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                            placeholder="0"
                        />
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            할인율 (%)
                        </label>
                        <input
                            type="text"
                            name="discount"
                            value={formData.discount}
                            onChange={(e) => {
                                const value = e.target.value;
                                // 숫자만 허용하고 100 이하로 제한
                                if (
                                    value === "" ||
                                    (/^\d+$/.test(value) &&
                                        parseInt(value) <= 100)
                                ) {
                                    handleInputChange(e);
                                }
                            }}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                            placeholder="100 이하만 가능"
                        />
                    </div>
                </div>

                {/* 색상 입력 */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        색상 *
                    </label>
                    <div className="mb-2 flex gap-2">
                        <input
                            type="text"
                            value={colorInput}
                            onChange={(e) => setColorInput(e.target.value)}
                            className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                            placeholder="색상을 입력하세요"
                            onKeyPress={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), addColor())
                            }
                        />
                        <button
                            type="button"
                            onClick={addColor}
                            className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                        >
                            추가
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.colors.map((color, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
                            >
                                {color}
                                <button
                                    type="button"
                                    onClick={() => removeColor(color)}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* 사이즈 입력 */}
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        사이즈 *
                    </label>
                    <div className="mb-2 flex gap-2">
                        <input
                            type="text"
                            value={sizeInput}
                            onChange={(e) => setSizeInput(e.target.value)}
                            className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                            placeholder="사이즈를 입력하세요"
                            onKeyPress={(e) =>
                                e.key === "Enter" &&
                                (e.preventDefault(), addSize())
                            }
                        />
                        <button
                            type="button"
                            onClick={addSize}
                            className="rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
                        >
                            추가
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {formData.size.map((size, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
                            >
                                {size}
                                <button
                                    type="button"
                                    onClick={() => removeSize(size)}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    ×
                                </button>
                            </span>
                        ))}
                    </div>
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
                    {mode === "create" ? (
                        <>
                            <button
                                type="button"
                                onClick={() => {
                                    const confirmMessage =
                                        "정말 초기값으로 되돌리시겠습니까?";

                                    if (confirm(confirmMessage)) resetAll();
                                }}
                                className="flex-1 rounded-md border border-gray-300 bg-red-500 py-2 text-white hover:bg-red-400"
                            >
                                초기화
                            </button>
                        </>
                    ) : (
                        <></>
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
