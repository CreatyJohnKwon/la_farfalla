import { AdditionalOption } from "@/src/widgets/modal/interface";

// for server and datas
interface Product {
    _id?: string;
    title: ProductTitleLanguage;
    description: ProductDescription;
    price: string;
    discount: string;
    image: string[];
    categories: string[];
    size: string[];
    quantity: string;
    options?: ProductOption[];
    additionalOptions?: AdditionalOption[];
    createdAt?: Date;
    averageRating?: number;
    ratingCount?: number;
}

type ProductPage = {
  data: Product[];    // 실제 상품 리스트
  hasMore: boolean;  // 다음 페이지 존재 여부
};

// useInfiniteQuery 반환값 타입
type InfiniteQueryResult = {
  pages: ProductPage[];  // pages 배열이 ProductPage 객체 배열임
  pageParams: number[];  // 페이지 번호 배열
};

interface ProductPayload extends Omit<Product, 'options' | 'additionalOptions'> {
    options?: Omit<ProductVariant, 'id'>[]; // ProductVariant에서 id 제외
    additionalOptions?: Omit<AdditionalOption, 'id'>[]; // AdditionalOption에서 id 제외
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

type ColorOptionsGenerator = (product: Product) => ProductOption[];
type StockChecker = (
    colorOptions: ProductOption[],
    selectedColor: string,
) => number;

type DropdownItem = ProductVariant | string;
type ProductDropdownItem = DropdownItem | AdditionalOption;

interface specialReviewItem {
    orderId?: string;
    productId: string;
    productName: string;
    productImage?: string[];
}

export type {
    Product,
    ProductPayload,
    ProductOption,
    ProductVariant,
    ProductPage,
    ProductDropdownItem,
    NewVariantType,
    ImageData,
    ColorOptionsGenerator,
    StockChecker,
    DropdownItem,
    SearchResult,
    specialReviewItem,
    InfiniteQueryResult
};
