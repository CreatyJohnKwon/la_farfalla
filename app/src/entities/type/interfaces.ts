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

interface NavListProps {
    menuText: string;
}

interface NavbarProps {
    children?: React.ReactNode;
}

interface ShopClientProps {
    posts: Posts[];
}

interface HomeClientProps {
    products: Products[];
}

interface ProductsProps {
    params: Promise<{ id: string }>;
}

interface LoginButtonProps {
    btnTitle: string;
    btnFunc?: () => void;
    btnColor?: string;
    btnDisabled?: boolean;
    btnType?: "button" | "submit" | "reset" | undefined;
}

export type {
    LoginButtonProps,
    ShopClientProps,
    HomeClientProps,
    ProductsProps,
    NavListProps,
    NavbarProps,
    Posts,
    Products,
    MenuItem,
};
