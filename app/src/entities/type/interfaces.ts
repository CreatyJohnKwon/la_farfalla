// for server and datas
interface Posts {
    _id: string;
    title: string;
    description: PostDescription;
    price: string;
    discount: string;
    category: string;
    image: string;
    colors: string;
    key: number;
    size: Array<string>;
}

interface PostDescription {
    image: string;
    text: string;
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

type CustomButtonProps = {
    btnTitle: string;
    btnFunc?: () => void;
    btnStyle?: string;
    btnDisabled?: boolean;
    btnType?: "button" | "submit" | "reset";
};

export type {
    RegistReqData,
    profNavDataProps,
    CustomButtonProps,
    ShopClientProps,
    HomeClientProps,
    SizeDropProps,
    menuDataProps,
    ProductsProps,
    navDataProps,
    NavListProps,
    NavbarProps,
    Products,
    MenuItem,
    Posts,
};
