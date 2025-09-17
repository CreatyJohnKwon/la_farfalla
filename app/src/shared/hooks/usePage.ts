import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import useCart from "./useCart";
import useProduct from "./useProduct";
import useUsers from "./useUsers";
import { adminEmails } from "public/data/common";
import { aboutMenuItems, adminMenuItems } from "@src/utils/dataUtils";
import { useCategoriesQuery } from "./react-query/useCategoryQuery";

const usePage = () => {
    const router = useRouter(); // useRouter 초기화
    const pathName = usePathname();

    const [pages, setPages] = useState("");
    const { navStartData, session } = useUsers();
    const { data: category, isLoading: isCategoryLoad } = useCategoriesQuery();
    const { openSidebar, setOpenSidebar, setSection } = useProduct(); // setSection 가져오기
    const { cartView, setCartView } = useCart();

    const [isVisible, setIsVisible] = useState(false);
    const [animationClass, setAnimationClass] = useState("animate-slide-in-left");

    const [textColor, setTextColor] = useState<string>("text-white");
    const [children, setChildren] = useState<any>(null);
    const [menuBg, setMenuBg] = useState<string>("bg-transparent");

    const onCloseSidebar = () => setOpenSidebar(false);
    const onOpenSidebar = () => setOpenSidebar(true);
    const isUserAdmin = adminEmails.includes(session?.user?.email ?? "");
    const menuData = isUserAdmin ? adminMenuItems : aboutMenuItems;
    const menuTitle = isUserAdmin ? "ADMIN" : "ABOUT";

    const instagramHandler = () =>
        window.open(
            "https://www.instagram.com/lafarfalla____?igsh=aHdsM3EzNzk1bDh5&utm_source=qr",
            "la_farfalla_instagram",
        );

    // Shop 드롭다운 메뉴 아이템 정의 (ShopDrop의 로직을 여기에 통합)
    const shopMenuItems = category ? [
        {
            label: "All",
            onClick: () => {
                setSection("");
                router.push("/shop");
            }
        },
        ...category.map((list) => ({
            label: list.name,
            onClick: () => {
                setSection(list.name);
                router.push("/shop");
            },
        }))
    ] : [];

    return {
        instagramHandler,

        router,
        session,
        pages,
        adminMenuItems,
        aboutMenuItems,
        
        setPages,
        setCartView,
        setOpenSidebar,
        setTextColor,
        setChildren,
        setIsVisible,
        setAnimationClass,
        setSection,
        setMenuBg,
        
        menuBg,
        openSidebar,
        menuData,
        menuTitle,
        isVisible,
        animationClass,
        isCategoryLoad,
        category,
        shopMenuItems,
        textColor,
        children,
        pathName,
        navStartData,
        cartView,

        onCloseSidebar,
        onOpenSidebar
    };
};

export default usePage;
