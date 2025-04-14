interface Post {
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

interface Shop {
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
    posts: Post[];
}

interface HomeClientProps {
    shops: Shop[];
}

interface ProductsProps {
    params: Promise<{ id: string }>;
}

interface MenuItem {
    text: string;
    link: string;
}

export type {
    ShopClientProps,
    HomeClientProps,
    ProductsProps,
    NavListProps,
    NavbarProps,
    Post,
    Shop,
    MenuItem,
};
