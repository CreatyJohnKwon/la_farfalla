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

// on client (props)
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

type OAuthProps = {
    where: "login" | "register";
};

type LoginButtonProps = {
    btnTitle: string;
    btnFunc?: () => void;
    btnColor?: string;
    btnDisabled?: boolean;
    btnType?: "button" | "submit" | "reset";
};

export type {
    LoginButtonProps,
    ShopClientProps,
    HomeClientProps,
    ProductsProps,
    NavListProps,
    NavbarProps,
    OAuthProps,
    Products,
    MenuItem,
    Posts,
};
