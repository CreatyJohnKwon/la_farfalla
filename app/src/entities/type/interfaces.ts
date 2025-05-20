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
    image?: string;
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
    provider: string;
    email: string;
    name: string;
    image?: string;
    address?: string;
    postcode?: string;
    reward: number;
    phoneNumber?: string;
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
};
