interface MenuItem {
    text: string;
    link: string;
}

interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    displayOrder?: number;
    createdAt: string;
    updatedAt: string;
}

// 카테고리 생성을 위해 API에 보내는 데이터 타입
// (id, slug, timestamps 등은 서버에서 자동 생성)
type CreateCategoryData = Omit<Category, '_id' | 'slug' | 'createdAt' | 'updatedAt'>;

// 카테고리 수정을 위해 API에 보내는 데이터 타입
type UpdateCategoryData = Partial<CreateCategoryData> & { _id: string };

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
    additional: string;
    quantity: number;
    discountPrice: number;
    originalPrice: number;
};

interface UserProfileData {
    _id: string;
    provider: "local" | "naver" | "kakao";
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

interface AddressModalProps {
    onComplete: (address: string) => void;
    onClose: () => void;
}

interface AddressData {
    address: string;
    zonecode: string;
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
    applicableProducts?: string[];
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

// 요청 타입
interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
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
    SelectedItem,
    Category,
    MenuItem,
    AddressModalProps,
    AddressData,
    CreateCategoryData,
    UpdateCategoryData,
    ApiResponse
};
