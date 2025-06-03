import { profNavDataProps, navDataProps } from "@src/entities/type/interfaces";

const navData: navDataProps = [{ text: "home" }, { text: "" }];

const profileNavData: profNavDataProps = [
    { id: "Order", title: "주문정보" },
    { id: "Edit", title: "회원정보수정" },
    { id: "Mileage", title: "적립금" },
    { id: "Coupon", title: "쿠폰" },
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
