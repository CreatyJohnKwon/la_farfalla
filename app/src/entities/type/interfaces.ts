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
}

interface ProductDescription {
    images: string[];
    text: string;
}

interface ProductTitleLanguage {
    kr: string;
    eg: string;
}

interface MenuItem {
    text: string;
    link: string;
}

interface Season {
    _id: string;
    title: string;
    year: string;
}

type RegistReqData = FormData | { [key: string]: any };

type NavListProps = {
    menuText: string;
};

type SizeDropProps = {
    size: Array<string>;
};

type NavbarProps = {
    children?: any;
    textColor?: string;
};

type profNavDataProps = {
    id: string;
    title: string;
}[];

type menuDataProps = {
    text: string;
    link: string;
}[];

type navDataProps = {
    text: string;
}[];

type CustomButtonProps = {
    btnTitle: string;
    btnFunc?: () => void;
    btnStyle?: string;
    btnDisabled?: boolean;
    btnType?: "button" | "submit" | "reset";
};

type SelectedItem = {
    _id?: string;
    image: string;
    title: string;
    userId: string | null;
    cartItemId: string;
    productId: string;
    size: string;
    color: string;
    quantity: number;
    discountPrice: number;
    originalPrice: number;
};

type ShippingStatus = "pending" | "ready" | "shipped" | "confirm" | "cancel";

interface UserProfileData {
    _id: string;
    provider: string;
    email: string;
    name: string;
    image?: string;
    address?: string;
    detailAddress?: string;
    postcode?: string;
    phoneNumber?: string;
    reward: number;
    mileage?: number;
    coupon?: number;
}

interface MileageItem {
    _id?: string;
    userId: string;
    type: "earn" | "spend";
    amount: number;
    description?: string;
    relatedOrderId?: string;
    createdAt: string;
}

interface Coupon {
    _id: string;
    userId: string;
    name: string;
    code: string;
    discountType: "fixed" | "percentage";
    discountValue: number;
    isUsed: boolean;
    usedAt?: string;
    issuedAt: string;
    expiredAt: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

interface OrderItem {
    productId: string;
    productNm: string;
    size: string;
    color: string;
    quantity: number;
}

interface OrderData {
    _id?: string;
    userId: string;
    userNm: string;
    phoneNumber: string;
    address: string;
    detailAddress: string;
    deliveryMemo: string;
    postcode: string;
    items: OrderItem[];
    totalPrice: number;
    createdAt?: string;
    payMethod: "간편결제" | "신용카드";
    shippingStatus: ShippingStatus;
    shippedAt?: string;
    trackingNumber?: string;
}

interface AddressModalProps {
    onComplete: (address: string) => void;
    onClose: () => void;
}

interface AddressData {
    address: string;
    zonecode: string;
}

interface OrderUpdateInput {
    orderId: string | undefined;
    shippingStatus: string;
    trackingNumber: string;
}

interface IDProps {
    params: Promise<{ id: string }>;
}

export type {
    profNavDataProps,
    CustomButtonProps,
    SizeDropProps,
    menuDataProps,
    navDataProps,
    NavListProps,
    NavbarProps,
    RegistReqData,
    UserProfileData,
    OrderData,
    OrderItem,
    SelectedItem,
    Season,
    MenuItem,
    Product,
    MileageItem,
    Coupon,
    AddressModalProps,
    AddressData,
    ShippingStatus,
    OrderUpdateInput,
    IDProps,
};
