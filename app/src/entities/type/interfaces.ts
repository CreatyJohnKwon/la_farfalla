// for server and datas
interface Posts {
    _id: string;
    title: PostTitleLanguage;
    description: PostDescription;
    price: string;
    discount: string;
    category: string;
    image: string;
    colors: Array<string>;
    key: number;
    size: Array<string>;
}

interface PostDescription {
    image: string;
    text: string;
}

interface PostTitleLanguage {
    kr: string;
    eg: string;
}

interface MenuItem {
    text: string;
    link: string;
}

interface Products {
    _id: string;
    title: string;
    key: number;
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

type ShopClientProps = {
    posts: Posts[];
};

type HomeClientProps = {
    products: Products[];
};

type IDProps = {
    params: Promise<{ id: string }>;
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
    userId: string | null | undefined;
    cartItemId: string;
    productId: string;
    size: string;
    color: string;
    quantity: number;
    discountPrice: number;
    originalPrice: number;
};

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

interface Mileage {
    _id: string;
    userId: string;
    type: "earn" | "spend";
    amount: number;
    description?: string;
    relatedOrderId?: string;
    expiredAt?: string;
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

export type {
    profNavDataProps,
    CustomButtonProps,
    ShopClientProps,
    HomeClientProps,
    SizeDropProps,
    menuDataProps,
    IDProps,
    navDataProps,
    NavListProps,
    NavbarProps,
    RegistReqData,
    UserProfileData,
    SelectedItem,
    Products,
    MenuItem,
    Posts,
    Mileage,
    Coupon,
};
