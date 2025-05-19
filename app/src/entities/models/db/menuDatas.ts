import { profNavDataProps, navDataProps } from "@/src/entities/type/interfaces";

const navData: navDataProps = [{ text: "home" }, { text: "" }];

const profileNavData: profNavDataProps = [
    { text: "Order", link: "o" },
    { text: "Profile", link: "e" },
    { text: "Mileage", link: "m" },
    { text: "Coupon", link: "c" },
];

const menuData = [
    {
        text: "Login",
        link: "/login",
    },
    {
        text: "Shop",
        link: "/shop",
    },
    {
        text: "Introduce",
        link: "/introduce",
    },
    {
        text: "Notice",
        link: "/notice",
    },
];

const folderData = [
    { id: "o", title: "Order" },
    { id: "e", title: "Edit" },
    { id: "m", title: "Mileage" },
    { id: "c", title: "Coupon" },
];

export { navData, menuData, profileNavData, folderData };
