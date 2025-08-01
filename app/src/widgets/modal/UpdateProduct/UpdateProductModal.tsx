"use client";

// 타입
import {
    UpdateProductModalProps,
    ImageData,
    ProductVariant,
    NewVariantType,
    Product,
} from "@/src/components/product/interface";
// 자식 컴포넌트
import Modal from "../Modal";
import Size from "./Size";
import Options from "./Options";
import Section from "./Section";
import DescriptionInfo from "./DescriptionInfo";
import ProductTitle from "./ProductTitle";
import UploadImage from "./UploadImage";
// 리액트라이브러리
import { useState, useEffect } from "react";
import { useSetAtom } from "jotai";
import { loadingAtom } from "@/src/shared/lib/atom";
import { uploadImagesToServer } from "@/src/shared/lib/uploadToR2";
// 훅
import useProduct from "@/src/shared/hooks/useProduct";
// 리액트 쿼리
import { useSeasonQuery } from "@/src/shared/hooks/react-query/useSeasonQuery";
import {
    usePostProductMutation,
    useUpdateProductMutation,
} from "@/src/shared/hooks/react-query/useProductQuery";

const UpdateProductModal: React.FC<UpdateProductModalProps> = ({
    onClose,
    product,
    mode = "create",
}) => {
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

    // 사이즈 상태
    const [sizeInput, setSizeInput] = useState<string>("");

    // 옵션 상태
    const [variants, setVariants] = useState<ProductVariant[]>([]);
    const [newVariant, setNewVariant] = useState<NewVariantType>({
        colorName: "",
        stockQuantity: 0,
    });

    // Hooks
    const { formData, setFormData } = useProduct();
    const { data: season, isLoading, error } = useSeasonQuery();
    const { mutateAsync: createProduct } = usePostProductMutation();
    const { mutateAsync: updateProduct } = useUpdateProductMutation();
    const setLoading = useSetAtom(loadingAtom);

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
            colorName: "",
            stockQuantity: 0,
        });

        setSizeInput("");
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

                // variants에서 options 배열 생성 (새로운 방식)
                const options = variants.map((variant: ProductVariant) => ({
                    colorName: variant.colorName,
                    stockQuantity: variant.stockQuantity,
                }));

                // 호환성을 위한 기존 필드들
                const uniqueColors = [
                    ...new Set(
                        variants.map((v: ProductVariant) => v.colorName),
                    ),
                ];
                const totalStock = variants.reduce(
                    (sum: number, v: ProductVariant) => sum + v.stockQuantity,
                    0,
                );

                const finalData: Product & { options: typeof options } = {
                    ...formData,
                    image: uploadedImageUrls,
                    description: {
                        images: uploadedDescriptionImageUrls,
                        text: formData.description.text,
                        detail: formData.description.detail,
                    },
                    // 새로운 options 기반 데이터
                    options: options,

                    // 호환성을 위한 기존 필드들 (필요시 제거 가능)
                    size: formData.size,
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
            const errorMessage =
                mode === "update"
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
                <div className="bg-white p-8">
                    <div className="text-center">로딩 중...</div>
                </div>
            </div>
        );
    }

    // 에러 상태
    if (error) {
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
        <Modal onClose={() => confirm("작성을 취소하시겠습니까?") && onClose()}>
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

                {/* 시즌, 가격, 할인율, 수량 */}
                <Section
                    formData={formData}
                    handleInputChange={handleInputChange}
                    season={season}
                    variants={variants}
                />

                {/* 색상 옵션 관리 */}
                <Options
                    variants={variants}
                    setVariants={setVariants}
                    newVariant={newVariant}
                    setNewVariant={setNewVariant}
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
        </Modal>
    );
};

export default UpdateProductModal;
