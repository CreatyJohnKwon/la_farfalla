"use client";

import {
    ImageData,
    ProductVariant,
    NewVariantType,
    Product,
} from "@src/components/product/interface";
import { useState, useEffect } from "react";
import { useSetAtom } from "jotai";
import { loadingAtom } from "@src/shared/lib/atom";
import { uploadImagesToServer } from "@src/shared/lib/uploadToR2";
import useProduct from "@src/shared/hooks/useProduct";
import {
    usePostProductMutation,
    useUpdateProductMutation,
} from "@src/shared/hooks/react-query/useProductQuery";
import ModalWrap from "./ModalWrap";
import UploadImage from "./UploadImage";
import ProductTitle from "./ProductTitle";
import DescriptionInfo from "./DescriptionInfo";
import CategorySelector from "./CategorySelector";
import Section from "./Section";
import Options from "../../components/product/Options";
import Size from "./Size";
import { AdditionalOption } from "./interface";
import AdditionalOptions from "@/src/components/product/AdditionalOptions";

interface UpdateProductModalProps {
    onClose: () => void;
    product?: Product;
    mode?: "create" | "update";
}

const UpdateProductModal = ({
    onClose,
    product,
    mode = "create",
}: UpdateProductModalProps) => {
    // 이미지 상태
    const [hasImageChanges, setHasImageChanges] = useState<boolean>(false);
    const [hasDescriptionImageChanges, setHasDescriptionImageChanges] =
        useState<boolean>(false);
    const [imageData, setImageData] = useState<ImageData>({
        previews: [],
        files: [],
        existingUrls: [],
    });
    const [descriptionImageData, setDescriptionImageData] = useState<ImageData>(
        {
            previews: [],
            files: [],
            existingUrls: [],
        },
    );
    const setLoading = useSetAtom(loadingAtom);

    // 사이즈 상태
    const [sizeInput, setSizeInput] = useState<string>("");

    // 옵션 상태
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [newVariant, setNewVariant] = useState<NewVariantType>({
        colorName: "",
        stockQuantity: 0,
    });

    // 추가 옵션 상태
    const [additionalOptions, setAdditionalOptions] = useState<AdditionalOption[]>([]);
    const [newAdditionalOption, setNewAdditionalOption] = useState({
        name: "",
        additionalPrice: 0,
        stockQuantity: 0
    });

    // Hooks
    const { mutateAsync: createProduct } = usePostProductMutation();
    const { mutateAsync: updateProduct } = useUpdateProductMutation();
    const { 
        category,
        formData, 
        setFormData,
        categoryLoading,
        categoryError
    } = useProduct();
    
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
                categories: product.categories,
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

            // ✨ 새로운 방식: options에서 variants 재생성
            if (
                product.options &&
                Array.isArray(product.options) &&
                product.options.length > 0
            ) {
                const existingVariants: ProductVariant[] = product.options.map(
                    (option, index) => ({
                        id: `${option.colorName}-${index}`,
                        colorName: option.colorName,
                        stockQuantity: option.stockQuantity,
                    }),
                );
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
                size: [],
                quantity: "",
                categories: []
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
            colorName: "",
            stockQuantity: 0,
        });

        setSizeInput("");
        setHasImageChanges(false);
        setHasDescriptionImageChanges(false);

        // 추가옵션 초기화
        setAdditionalOptions([]);
        setNewAdditionalOption({ name: "", additionalPrice: 0, stockQuantity: 0 });
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
                categories: product.categories,
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

            // ✨ 새로운 방식: options에서 variants 생성
            if (
                product.options &&
                Array.isArray(product.options) &&
                product.options.length > 0
            ) {
                // options 배열이 있으면 그것을 사용 (새로운 방식)
                const existingVariants: ProductVariant[] = product.options.map(
                    (option, index) => ({
                        id: `${option.colorName}-${index}`,
                        colorName: option.colorName,
                        stockQuantity: option.stockQuantity,
                    }),
                );
                setVariants(existingVariants);
            }

            if (product.additionalOptions && Array.isArray(product.additionalOptions)) {
                const existingAddOpts = product.additionalOptions.map((opt, index) => ({
                    ...opt,
                    id: `${opt.name}-${index}`, // id가 없다면 생성
                    stockQuantity: opt.stockQuantity || 0, // DB에 stock이 없을 경우 대비
                }));
                setAdditionalOptions(existingAddOpts);
            }
        } else {
            resetAll();
        }
    }, [mode, product]);

    // Input 변경 핸들러
    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ): void => {
        const { name, value } = e.target;

        if (name === "titleKr") {
            setFormData((prev: any) => ({
                ...prev,
                title: { ...prev.title, kr: value },
            }));
        } else if (name === "titleEg") {
            setFormData((prev: any) => ({
                ...prev,
                title: { ...prev.title, eg: value },
            }));
        } else if (name === "descriptionText") {
            setFormData((prev: any) => ({
                ...prev,
                description: { ...prev.description, text: value },
            }));
        } else if (name === "descriptionDetailText") {
            setFormData((prev: any) => ({
                ...prev,
                description: { ...prev.description, detail: value },
            }));
        } else if (
            name === "price" ||
            name === "discount" ||
            name === "quantity"
        ) {
            const numericValue = value.replace(/,/g, "");
            if (!/^\d*$/.test(numericValue)) return;

            setFormData((prev: any) => ({
                ...prev,
                [name]: numericValue,
            }));
        } else {
            setFormData((prev: any) => ({
                ...prev,
                [name]: value,
            }));
        }
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
            {
                condition: !formData.size || formData.size.length === 0,
                message: "최소 1개 이상의 사이즈를 등록해주세요.",
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
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
    ): Promise<void> => {
        e.preventDefault();

        try {
            const confirmMessage =
                mode === "update"
                    ? "상품을 업데이트 하시겠습니까?"
                    : "상품을 등록하시겠습니까?";

            if (validateForm() && confirm(confirmMessage)) {
                setLoading(true);

                let uploadedImageUrls: string[] = imageData.existingUrls;
                let uploadedDescriptionImageUrls: string[] =
                    descriptionImageData.existingUrls;

                // 이미지 업로드 처리
                if (hasImageChanges && imageData.files.length > 0) {
                    const newImageUrls = await uploadImagesToServer(
                        imageData.files,
                    );
                    if (newImageUrls) {
                        uploadedImageUrls = [
                            ...imageData.existingUrls,
                            ...newImageUrls,
                        ];
                    }
                } else if (!hasImageChanges) {
                    uploadedImageUrls = formData.image;
                }

                // 설명 이미지 업로드 처리
                if (
                    hasDescriptionImageChanges &&
                    descriptionImageData.files.length > 0
                ) {
                    const newDescriptionImageUrls = await uploadImagesToServer(
                        descriptionImageData.files,
                    );
                    if (newDescriptionImageUrls) {
                        uploadedDescriptionImageUrls = [
                            ...descriptionImageData.existingUrls,
                            ...newDescriptionImageUrls,
                        ];
                    }
                }

                const totalStock = variants.reduce(
                    (sum: number, v: ProductVariant) => sum + v.stockQuantity,
                    0,
                );

                const finalData: Product = {
                    ...formData,
                    image: uploadedImageUrls,
                    description: {
                        images: uploadedDescriptionImageUrls,
                        text: formData.description.text,
                        detail: formData.description.detail,
                    },
                    options: variants,
                    quantity: totalStock.toString(),
                    additionalOptions: additionalOptions, 
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
            const errorMessage =
                mode === "update"
                    ? "상품 업데이트 중 오류가 발생했습니다."
                    : "상품 등록 중 오류가 발생했습니다.";
            alert(errorMessage);
            setLoading(false);
        }
    };

    // 로딩 상태
    if (categoryLoading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white p-8">
                    <div className="text-center">로딩 중...</div>
                </div>
            </div>
        );
    }

    // 에러 상태
    if (categoryError) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white p-8">
                    <div className="text-center text-red-600">
                        데이터를 불러오는데 실패했습니다.
                    </div>
                    <button
                        onClick={() =>
                            confirm("작성을 취소하시겠습니까?") && onClose()
                        }
                        className="mt-4 bg-gray-900 px-4 py-2 text-white"
                    >
                        닫기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <ModalWrap onClose={() => confirm("작성을 취소하시겠습니까?") && onClose()}>
            <h1 className="mb-8 text-center text-2xl font-bold text-gray-900">
                {mode === "update" ? "상품 수정" : "상품 등록"}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* 이미지 업로드 섹션 */}
                <UploadImage
                    mode={mode}
                    imageData={imageData}
                    setImageData={setImageData}
                    hasImageChanges={hasImageChanges}
                    setHasImageChanges={setHasImageChanges}
                />

                {/* 상품명 입력 */}
                <ProductTitle
                    formData={formData}
                    handleInputChange={handleInputChange}
                />

                {/* 상품 설명 */}
                <DescriptionInfo
                    formData={formData}
                    handleInputChange={handleInputChange}
                    hasDescriptionImageChanges={hasDescriptionImageChanges}
                    setHasDescriptionImageChanges={
                        setHasDescriptionImageChanges
                    }
                    descriptionImageData={descriptionImageData}
                    setDescriptionImageData={setDescriptionImageData}
                />

                {/* 카테고리 */}
                <CategorySelector
                    selectedCategories={formData.categories} 
                    setSelectedCategories={(newCategories) => 
                        setFormData((prev: Product) => ({ ...prev, categories: newCategories }))}
                    allCategories={category}
                />

                {/* 가격, 할인율, 수량 */}
                <Section
                    formData={formData}
                    handleInputChange={handleInputChange}
                    variants={variants}
                />

                {/* 색상 옵션 관리 */}
                <Options
                    variants={variants}
                    setVariants={setVariants}
                    newVariant={newVariant}
                    setNewVariant={setNewVariant}
                />

                {/* 추가 옵션 관리 */}
                <AdditionalOptions 
                    additionalOptions={additionalOptions}
                    setAdditionalOptions={setAdditionalOptions}
                    newAdditionalOption={newAdditionalOption}
                    setNewAdditionalOption={setNewAdditionalOption}
                />

                {/* 사이즈 입력 */}
                <Size
                    sizeInput={sizeInput}
                    setSizeInput={setSizeInput}
                    formData={formData}
                    setFormData={setFormData}
                />

                {/* 버튼 영역 */}
                <div className="flex gap-4 pt-6">
                    <button
                        type="button"
                        onClick={() =>
                            confirm("작성을 취소하시겠습니까?") && onClose()
                        }
                        className="flex-1 border border-gray-300 py-4 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                        닫기
                    </button>
                    {mode === "create" && (
                        <button
                            type="button"
                            onClick={() => {
                                if (
                                    confirm("정말 초기값으로 되돌리시겠습니까?")
                                ) {
                                    resetAll();
                                }
                            }}
                            className="flex-1 border border-gray-600 bg-gray-600 py-4 font-bold text-white transition-colors hover:bg-gray-700"
                        >
                            초기화
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex-1 bg-gray-900 py-4 font-bold text-white transition-colors hover:bg-gray-800"
                    >
                        {mode === "update" ? "상품 수정" : "상품 등록"}
                    </button>
                </div>
            </form>
        </ModalWrap>
    );
};

export default UpdateProductModal;
