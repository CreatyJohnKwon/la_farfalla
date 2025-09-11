import { profNavDataProps, navDataProps } from "@src/entities/type/interfaces";

const navData: navDataProps = [{ text: "home" }, { text: "" }];

const profileNavData: profNavDataProps = [
    { id: "ORDER", title: "주문정보" },
    { id: "EDIT", title: "정보수정" },
    { id: "MILEAGE", title: "적립금" },
    { id: "COUPON", title: "쿠폰" },
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
