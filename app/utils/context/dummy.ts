const navData = [{ text: "home" }, { text: "" }];

const menuData = [
    {
        text: "Login",
        link: "/login",
    },
    {
        text: "Shop",
        link: "/shop",
        child: [
            {
                text: "25 S/S",
                query: "1",
            },
            {
                text: "25 A/W",
                query: "2",
            },
        ],
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

export { navData, menuData };
