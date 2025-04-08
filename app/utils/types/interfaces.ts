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
}

interface NavListProps {
    menuText: string;
}

export type {
    Post,
    NavListProps
}