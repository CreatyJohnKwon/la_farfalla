import { profNavDataProps, navDataProps } from "@/src/entities/type/interfaces";

const navData: navDataProps = [{ text: "home" }, { text: "" }];

const profileNavData: profNavDataProps = [
    { text: "정보수정", link: "e" },
    { text: "주문조회", link: "o" },
    { text: "1:1 문의", link: "q" },
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
