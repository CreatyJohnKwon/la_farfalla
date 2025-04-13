interface Post {
    _id: string;
    title: string;
    description: string;
    price: string;
    discount: string;
    tag: string[];
    category: string;
    image: string;
    colors: string;
    key: number;
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

interface ChildItem {
    text: string;
    query: number;
}

interface MenuItem {
    text: string;
    link: string;
    child?: ChildItem[];
}

export type {
    ShopClientProps,
    Post,
    NavListProps,
    NavbarProps,
    MenuItem,
    ChildItem,
};
