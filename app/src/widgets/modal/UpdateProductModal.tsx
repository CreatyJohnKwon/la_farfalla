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

const UpdateProductModal = ({
    onClose,
    season,
    product, // 기존 상품 데이터 (업데이트 시)
    mode = "create", // "create" | "update"
}: {
    onClose: () => void;
    season?: Season[];
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
    const [descriptionImage, setDescriptionImage] = useState<File | null>(null);
    const [hasImageChanges, setHasImageChanges] = useState<boolean>(false);
    const [hasDescriptionImageChanges, setHasDescriptionImageChanges] =
        useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { formData, setFormData } = useProduct();

    const { mutateAsync: createProduct } = usePostProductMutation();
    const { mutateAsync: updateProduct } = useUpdateProductMutation();

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
                seasonId: product.seasonId,
                size: product.size,
            });

            // 기존 이미지 데이터 설정
            setImageData({
                previews: product.image || [],
                files: [],
                existingUrls: product.image || [],
            });
        }
    }, [mode, product, setFormData]);

    // 수정된 resetAll 함수
    const resetAll = () => {
        const confirmMessage =
            mode === "update"
                ? "정말 초기값으로 되돌리시겠습니까?"
                : "정말 모두 초기화하시겠습니까?";

        if (confirm(confirmMessage)) {
            if (mode === "update" && product) {
                // 업데이트 모드: 원본 데이터로 리셋
                setFormData({
                    title: product.title,
                    description: product.description,
                    price: product.price,
                    discount: product.discount || "",
                    image: product.image,
                    colors: product.colors,
                    seasonId: product.seasonId,
                    size: product.size,
                });

                setImageData({
                    previews: product.image || [],
                    files: [],
                    existingUrls: product.image || [],
                });
            } else {
                // 생성 모드: 빈 값으로 리셋
                setFormData({
                    title: { kr: "", eg: "" },
                    description: { image: "", text: "" },
                    price: "",
                    discount: "",
                    image: [],
                    colors: [],
                    seasonId: "",
                    size: [],
                });

                setImageData({
                    previews: [],
                    files: [],
                    existingUrls: [],
                });
            }

            setColorInput("");
            setSizeInput("");
            setDescriptionImage(null);
            setHasImageChanges(false);
            setHasDescriptionImageChanges(false);
        }
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
                condition: !formData.seasonId,
                message: "시즌을 선택해주세요.",
            },
            {
                condition: !formData.description.text,
                message: "설명을 적어주세요.",
            },
            {
                condition: mode === "create" && !descriptionImage,
                message: "설명 이미지를 선택해주세요.",
            },
            {
                condition:
                    mode === "update" &&
                    !formData.description.image &&
                    !descriptionImage,
                message: "설명 이미지를 선택해주세요.",
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
                let uploadedDescriptionImageUrl: string =
                    formData.description.image;
                if (hasDescriptionImageChanges && descriptionImage) {
                    const newDescriptionImageUrls =
                        await uploadImagesToServer(descriptionImage);
                    if (newDescriptionImageUrls && newDescriptionImageUrls[0]) {
                        uploadedDescriptionImageUrl =
                            newDescriptionImageUrls[0];
                    }
                }

                const finalData: Product = {
                    ...formData,
                    image: uploadedImageUrls,
                    description: {
                        image: uploadedDescriptionImageUrl,
                        text: formData.description.text,
                    },
                };

                // 업데이트 모드인 경우 ID 포함
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
            const errorMessage =
                mode === "update"
                    ? "상품 업데이트 중 오류가 발생했습니다."
                    : "상품 등록 중 오류가 발생했습니다.";
            alert(errorMessage);
        }
    };

    const handleDescriptionImageChange = (file: File) => {
        setDescriptionImage(file);
        setHasDescriptionImageChanges(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setFormData((prev) => ({
                    ...prev,
                    description: {
                        ...prev.description,
                        image: e.target?.result as string,
                    },
                }));
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
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
                                    className="relative flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-gray-300"
                                >
                                    {imageData.previews[index] ? (
                                        <>
                                            <Image
                                                src={imageData.previews[index]}
                                                alt={`Preview ${index + 1}`}
                                                fill
                                                className="rounded-lg object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeImage(index)
                                                }
                                                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-sm text-white hover:bg-red-600"
                                            >
                                                ×
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <div className="mb-2 text-2xl">
                                                +
                                            </div>
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
                            className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            현재 {imageData.previews.length}/3개
                            {mode === "update" &&
                                hasImageChanges &&
                                " (변경됨)"}
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
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
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
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
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
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                            placeholder="상품 설명을 입력하세요"
                            rows={3}
                        />

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            상품 설명 이미지 *{" "}
                            {hasDescriptionImageChanges && "(변경됨)"}
                        </label>
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-4">
                            {formData.description.image ? (
                                <div className="relative">
                                    <div className="relative h-64 w-full overflow-y-auto rounded-lg border border-gray-200">
                                        <Image
                                            src={formData.description.image}
                                            alt="설명 이미지 미리보기"
                                            width={800}
                                            height={600}
                                            className="w-full object-contain"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData((prev) => ({
                                                ...prev,
                                                description: {
                                                    ...prev.description,
                                                    image: "",
                                                },
                                            }));
                                            setDescriptionImage(null);
                                            setHasDescriptionImageChanges(true);
                                        }}
                                        className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                    <div className="mt-2 text-center">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const input =
                                                    document.createElement(
                                                        "input",
                                                    );
                                                input.type = "file";
                                                input.accept = "image/*";
                                                input.onchange = (e) => {
                                                    const file = (
                                                        e.target as HTMLInputElement
                                                    ).files?.[0];
                                                    if (file) {
                                                        handleDescriptionImageChange(
                                                            file,
                                                        );
                                                    }
                                                };
                                                input.click();
                                            }}
                                            className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200"
                                        >
                                            이미지 변경
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                                        <svg
                                            className="h-8 w-8 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <div className="mb-2 text-sm text-gray-600">
                                        상품 설명 이미지를 업로드하세요
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const input =
                                                document.createElement("input");
                                            input.type = "file";
                                            input.accept = "image/*";
                                            input.onchange = (e) => {
                                                const file = (
                                                    e.target as HTMLInputElement
                                                ).files?.[0];
                                                if (file) {
                                                    handleDescriptionImageChange(
                                                        file,
                                                    );
                                                }
                                            };
                                            input.click();
                                        }}
                                        className="rounded-lg bg-gray-200 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                                    >
                                        이미지 선택
                                    </button>
                                    <p className="mt-2 text-xs text-gray-500">
                                        JPG, PNG, GIF 파일을 지원합니다
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 카테고리, 시즌, 가격, 할인율 */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                시즌 추가
                            </label>
                            <button
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                                type="button"
                            >
                                추가 하기
                            </button>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                시즌 *
                            </label>
                            <select
                                name="seasonId"
                                value={formData.seasonId}
                                onChange={handleInputChange}
                                className="h-[42px] w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                            >
                                <option key={"default"} value="">
                                    시즌 선택
                                </option>
                                {season?.map((item, index) => (
                                    <option key={index} value={item._id}>
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
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
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
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
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
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                                placeholder="색상을 입력하세요"
                                onKeyPress={(e) =>
                                    e.key === "Enter" &&
                                    (e.preventDefault(), addColor())
                                }
                            />
                            <button
                                type="button"
                                onClick={addColor}
                                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
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
                                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                                placeholder="사이즈를 입력하세요"
                                onKeyPress={(e) =>
                                    e.key === "Enter" &&
                                    (e.preventDefault(), addSize())
                                }
                            />
                            <button
                                type="button"
                                onClick={addSize}
                                className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
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
                            onClick={onClose}
                            className="flex-1 rounded-lg border border-gray-300 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            닫기
                        </button>
                        <button
                            type="button"
                            onClick={resetAll}
                            className="flex-1 rounded-lg border border-gray-300 bg-red-500 py-2 text-white hover:bg-red-400"
                        >
                            {mode === "update" ? "초기값으로" : "초기화"}
                        </button>
                        <button
                            type="submit"
                            className="flex-1 rounded-lg bg-gray-800 py-2 text-white hover:bg-gray-700"
                        >
                            {mode === "update" ? "상품 수정" : "상품 등록"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default UpdateProductModal;
