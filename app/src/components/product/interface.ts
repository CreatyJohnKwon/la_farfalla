// for server and datas
interface Product {
    _id?: string;
    title: ProductTitleLanguage;
    description: ProductDescription;
    price: string;
    discount: string;
    image: string[];
    seasonName: string;
    size: Array<string>;
    quantity: string;
    options?: ProductOption[];
    createdAt?: Date;
    averageRating?: number;
    ratingCount?: number;
}

interface ProductOption {
    productId?: string;
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

// 검색 결과 타입
interface SearchResult extends Product {
    score: number;
    matchType: "title" | "description" | "season" | "color";
}

interface SearchFloatingButtonProps {
    products: Product[];
    onSearch: (query: string, filteredProducts: Product[]) => void;
}

// 검색 결과 타입
interface SearchResult {
    _id?: string;
    title: {
        kr: string;
        eg: string;
    };
    description: {
        images: string[];
        text: string;
        detail: string;
    };
    price: string;
    discount: string;
    image: string[];
    seasonName: string;
    size: Array<string>;
    quantity: string;
    options?: Array<{
        productId?: string;
        colorName: string;
        stockQuantity: number;
    }>;
    createdAt?: Date;
    score: number;
    matchType: "title" | "description" | "season" | "color";
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

interface specialReviewItem {
    orderId?: string;
    productId: string;
    productName: string;
    productImage?: string[];
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
    SearchFloatingButtonProps,
    SearchResult,
    specialReviewItem
};
