import {
    NewVariantType,
    Product,
    ProductVariant,
    ImageData,
} from "@src/components/product/interface";
import { Category } from "@src/entities/type/interfaces";
import { SetStateAction } from "jotai";
import { Dispatch } from "react";

interface SizeProps {
    sizeInput: string;
    setSizeInput: Dispatch<SetStateAction<string>>;
    formData: Product;
    setFormData: Dispatch<SetStateAction<Product>>;
}

interface OptionsProps {
    variants: ProductVariant[];
    setVariants: Dispatch<SetStateAction<ProductVariant[]>>;
    newVariant: NewVariantType;
    setNewVariant: Dispatch<SetStateAction<NewVariantType>>;
}

interface SectionProps {
    formData: Product;
    handleInputChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => void;
    // category: Category[] | undefined;
    variants: ProductVariant[];
}

interface DescriptionInfoProps {
    formData: Product;
    handleInputChange: (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
    ) => void;
    // ✅ description 관련 상태만 사용
    hasDescriptionImageChanges: boolean;
    setHasDescriptionImageChanges: Dispatch<SetStateAction<boolean>>;
    descriptionImageData: ImageData;
    setDescriptionImageData: Dispatch<SetStateAction<ImageData>>;
}

interface UploadImageProps {
    mode: string;
    imageData: ImageData;
    setImageData: Dispatch<SetStateAction<ImageData>>;
    hasImageChanges: boolean;
    setHasImageChanges: Dispatch<SetStateAction<boolean>>;
}

export type {
    SizeProps,
    OptionsProps,
    SectionProps,
    DescriptionInfoProps,
    UploadImageProps,
};
