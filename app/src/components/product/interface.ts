// for server and datas
interface Product {
    _id?: string;
    title: ProductTitleLanguage;
    description: ProductDescription;
    price: string;
    discount: string;
    image: string[];
    colors: Array<string>;
    seasonName: string;
    size: Array<string>;
    quantity: string;
    options?: ProductOption[];
}

interface ProductOption {
    colorName: string;
    stockQuantity: number;
}

interface ProductDescription {
    images: string[];
    text: string;
    detail: string;
}

interface ProductTitleLanguage {
    kr: string;
    eg: string;
}

// ProductVariant 타입 정의 - 색상 옵션만
interface ProductVariant {
    id: string;
    colorName: string;
    stockQuantity: number;
}

// 새 옵션 타입
type NewVariantType = Omit<ProductVariant, "id" | "optionNumber">;

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

interface ProductsListProps {
    product: Product;
    index?: number;
}

type ColorOptionsGenerator = (product: Product) => ProductOption[];
type StockChecker = (
    colorOptions: ProductOption[],
    selectedColor: string,
) => number;

// 🆕 타입 정의
type DropdownItem = string | { colorName: string; stockQuantity: number };

interface ProductDropProps {
    title: string;
    items: DropdownItem[];
    selected: string;
    setSelected: React.Dispatch<React.SetStateAction<string>>;
    type?: "size" | "color"; // 타입 구분
}

export type {
    Product,
    ProductOption,
    ProductsListProps,
    ProductVariant,
    NewVariantType,
    ImageData,
    UpdateProductModalProps,
    ColorOptionsGenerator,
    StockChecker,
    ProductDropProps,
    DropdownItem,
};
