"use client";

import { motion } from "framer-motion";
import { useState, useRef } from "react";
import Image from "next/image";
import { Product, Season } from "@/src/entities/type/interfaces";
import { format } from "date-fns";

const UpdateProductModal = ({
    onClose,
    season,
}: {
    onClose: () => void;
    season?: Season[];
}) => {
    const [formData, setFormData] = useState<Product>({
        title: {
            kr: "",
            eg: "",
        },
        description: {
            image: "",
            text: "",
        },
        price: "",
        discount: "",
        category: "",
        image: [],
        colors: [],
        seasonId: "",
        size: [],
    });

    const [colorInput, setColorInput] = useState<string>("");
    const [sizeInput, setSizeInput] = useState<string>("");
    const [imagePreview, setImagePreview] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetAll = () => {
        if (confirm("정말 모두 초기화하시겠습니까?")) {
            setFormData({
                title: {
                    kr: "",
                    eg: "",
                },
                description: {
                    image: "",
                    text: "",
                },
                price: "",
                discount: "",
                category: "",
                image: [],
                colors: [],
                seasonId: "",
                size: [],
            });
            setColorInput("");
            setSizeInput("");
            setImagePreview([]);
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
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        if (formData.image.length + files.length > 3) {
            alert("이미지는 최대 3개까지만 업로드할 수 있습니다.");
            return;
        }

        const newImages = [...formData.image, ...files];
        // 이미지 추가 로직 넣기
        // setFormData((prev) => ({ ...prev, image: newImages }));

        // 미리보기 생성
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target?.result) {
                    setImagePreview((prev) => [
                        ...prev,
                        e.target?.result as string,
                    ]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        const newImages = formData.image.filter((_, i) => i !== index);
        const newPreviews = imagePreview.filter((_, i) => i !== index);

        setFormData((prev) => ({ ...prev, image: newImages }));
        setImagePreview(newPreviews);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.image.length !== 3) {
            alert("이미지를 정확히 3개 업로드해주세요.");
            return;
        }

        if (!formData.title.kr || !formData.title.eg) {
            alert("상품명(한글, 영어)을 모두 입력해주세요.");
            return;
        }

        if (!formData.category) {
            alert("카테고리를 선택해주세요.");
            return;
        }

        // 상품 등록로직
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
                    상품 등록
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
                                    {imagePreview[index] ? (
                                        <>
                                            <Image
                                                src={imagePreview[index]}
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
                            현재 {formData.image.length}/3개 업로드됨
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
                            상품 설명
                        </label>
                        <textarea
                            name="descriptionText"
                            value={formData.description.text}
                            onChange={handleInputChange}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                            placeholder="상품 설명을 입력하세요"
                            rows={3}
                        />
                    </div>

                    {/* 카테고리, 시즌, 가격, 할인율 */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                시즌
                            </label>
                            <button
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                                type="button"
                            >
                                시즌 추가
                            </button>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                시즌
                            </label>
                            <select
                                name="seasonId"
                                value={formData.seasonId}
                                onChange={handleInputChange}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-gray-500 focus:outline-none"
                            >
                                <option value="" defaultChecked>
                                    시즌 선택
                                </option>
                                {season?.map((item, index) => (
                                    <option value={item.title}>
                                        {item.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                가격 (원)
                            </label>
                            <input
                                type="text"
                                name="price"
                                value={formData.price}
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
                            색상
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
                            사이즈
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
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={resetAll}
                            className="flex-1 rounded-lg border border-gray-300 bg-red-500 py-2 text-white hover:bg-red-400"
                        >
                            초기화
                        </button>
                        <button
                            type="submit"
                            className="flex-1 rounded-lg bg-gray-800 py-2 text-white hover:bg-gray-700"
                        >
                            상품 등록
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default UpdateProductModal;
