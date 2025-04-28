// for server and datas
interface Posts {
    _id: string;
    title: string;
    description: string;
    price: string;
    discount: string;
    category: string;
    image: string;
    colors: string;
    key: number;
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

type NavbarProps = {
    children?: React.ReactNode;
};

type ShopClientProps = {
    posts: Posts[];
};

type HomeClientProps = {
    products: Products[];
};

type ProductsProps = {
    params: Promise<{ id: string }>;
};

type profNavDataProps = {
    text: string;
    link: "e" | "o" | "q";
}[];

type menuDataProps = {
    text: string;
    link: string;
}[];

type navDataProps = {
    text: string;
}[];

type LoginButtonProps = {
    btnTitle: string;
    btnFunc?: () => void;
    btnStyle?: string;
    btnDisabled?: boolean;
    btnType?: "button" | "submit" | "reset";
};

export type {
    RegistReqData,
    profNavDataProps,
    LoginButtonProps,
    ShopClientProps,
    HomeClientProps,
    menuDataProps,
    ProductsProps,
    navDataProps,
    NavListProps,
    NavbarProps,
    Products,
    MenuItem,
    Posts,
};
