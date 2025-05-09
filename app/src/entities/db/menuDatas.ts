import { profNavDataProps, navDataProps } from "@/src/entities/type/interfaces";

const navData: navDataProps = [{ text: "home" }, { text: "" }];

const profileNavData: profNavDataProps = [
    { text: "Order", link: "o" },
    // { text: "1:1 문의", link: "q" },
    { text: "Profile", link: "e" },
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
