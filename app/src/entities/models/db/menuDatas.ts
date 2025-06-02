import { profNavDataProps, navDataProps } from "@src/entities/type/interfaces";

const navData: navDataProps = [{ text: "home" }, { text: "" }];

const profileNavData: profNavDataProps = [
    { id: "Order" },
    { id: "Edit" },
    { id: "Mileage" },
    { id: "Coupon" },
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

export { navData, menuData, profileNavData };
