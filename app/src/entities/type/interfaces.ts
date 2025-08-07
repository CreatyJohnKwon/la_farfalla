import { Product } from "@/src/components/product/interface";

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
    address?: string;
    detailAddress?: string;
    postcode?: string;
    phoneNumber?: string;
    reward: number;
    mileage?: number;
    coupon?: number;
    deletedAt?: Date;
    createdAt?: Date;
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

interface OrderItem {
    productId: string;
    productNm: string;
    size: string;
    color: string;
    quantity: number;
    price?: number;
    image?: string[];
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
    payMethod: "NAVER_PAY" | "KAKAO_PAY" | "CARD";
    paymentId?: string;
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
    trackingNumber: string | undefined;
}

interface IDProps {
    params: Promise<{ id: string }>;
}

interface ModalProps {
    onClose: () => void;
    children: React.ReactNode;
    className?: string; // 추가
    containerClassName?: string; // 컨테이너용 추가
}

interface ICoupon {
    _id?: string;
    code: string;
    name: string;
    description: string;
    type: "common" | "personal" | "event";
    discountType: "fixed" | "percentage";
    discountValue: number;
    startAt: Date;
    endAt: Date;
    isActive: boolean;
    maxUsage: number | null; // null로 명시적 정의
    maxUsagePerUser: number | null;
    currentUsage: number;
    applicableCategories?: string[];
    applicableProducts?: string[];
    excludeCategories?: string[];
    excludeProducts?: string[];
    createdAt: Date;
    updatedAt: Date;
}

interface IUserCoupon {
    _id?: string;
    userId: string;
    couponId: string;
    isUsed: boolean;
    usedAt?: Date;
    usedOrderId?: string;
    discountAmount?: number;
    assignedAt: Date;
    assignmentType: "manual" | "auto" | "event" | "signup";
    createdAt: Date;
    updatedAt: Date;
}
interface ICouponDocument extends ICoupon, Document {
    isValid: boolean;
}

interface IUserCouponDocument extends IUserCoupon, Document {
    isExpired: boolean;
}

interface IUserCouponPopulated extends Omit<IUserCoupon, "couponId"> {
    couponId: ICoupon; // populate된 쿠폰 정보
}

// 쿠폰 API 조회 정보
interface CouponResponse {
    type: "userCoupons" | "allCoupons";
    data: UserCouponWithPopulate[];
    count: number;
}

interface UserCouponWithPopulate {
    _id: string;
    userId: UserProfileData;
    couponId: ICoupon; // populate된 쿠폰 정보
    isUsed: boolean;
    usedAt?: Date;
    usedOrderId?: string;

    discountType: "fixed" | "percentage";
    discountValue: number;
    isActive: boolean;
    assignedAt: Date;
    assignmentType: "manual" | "auto" | "event" | "signup";
    name?: string;
    description?: string;
    code?: string;
    type?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface SMSOrderData {
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    itemCount: number;
}

interface SMSResult {
    success: boolean;
    requestId?: string;
    statusCode?: string;
    statusName?: string;
}

export type {
    ICoupon,
    IUserCoupon,
    IUserCouponDocument,
    IUserCouponPopulated,
    ICouponDocument,
    CouponResponse,
    UserCouponWithPopulate,
    ModalProps,
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
    MileageItem,
    AddressModalProps,
    AddressData,
    ShippingStatus,
    OrderUpdateInput,
    IDProps,
    SMSOrderData,
    SMSResult,
};
