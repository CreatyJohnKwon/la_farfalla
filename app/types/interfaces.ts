import { StaticImageData } from "next/image";

// Data Props Interfaces
interface BlogItem {
    title: string;
    description: string;
    link: string;
    bloggername: string;
    postdate: string;
} 

interface Item {
    title: string;
    link: string;
    description: string;
    bloggername: string;
    postdate: string;
}

// Components Props Interfaces
interface CustomImageProps {
    alt: string;
    src: StaticImageData;
    gradation: string;
    objectFit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

interface ModalProps {
    title: string;
    open: boolean;
    handler: () => void;
    children: React.ReactNode;
    close: string;
}

interface NavListProps {
    menuText: string;
}

interface NaverMapsProps {
    className: string;
}

interface PastorTextsProps {
    profileImg: StaticImageData;
}

interface BlogListProps {
    item: BlogItem;
}

interface VideoEmbedProps {
    className: string;
    url: string;
}

export type {
    Item,
    BlogItem,
    ModalProps,
    NavListProps,
    NaverMapsProps,
    PastorTextsProps,
    CustomImageProps,
    BlogListProps,
    VideoEmbedProps
}