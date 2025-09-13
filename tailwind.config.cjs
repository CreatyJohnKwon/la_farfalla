const tailwindScrollbarHide = require("tailwind-scrollbar-hide");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            animation: {
                "slide-in-left": "slideInLeft 0.5s ease-out forwards",
                "slide-out-left": "slideOutLeft 0.5s ease-in forwards",
                "fade-in": "fade-in 0.5s ease-in-out forwards",
                "fade-out": "fade-out 0.5s ease-in-out forwards",
                marquee: "marquee 30s linear infinite",
            },
            keyframes: {
                slideInLeft: {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(0)" },
                },
                slideOutLeft: {
                    "0%": { transform: "translateX(0)" },
                    "100%": { transform: "translateX(-100%)" },
                },
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                marquee: {
                    "0%": { transform: "translateX(0%)" },
                    "100%": { transform: "translateX(-50%)" },
                },
            },
            letterSpacing: {
                tightest: "-0.075em",
            },
            fontFamily: {
                pretendard: ['"Pretendard Variable"', "serif"],
                abhaya: ["Abahaya Libre", "serif"],
            },
            screens: {
                c_xl: "1850px",
                c_lg: "1610px",
                c_md: "1150px",
                c_base: "500px",
                c_sm: "360px",
            },
        },
    },
    darkMode: "class",
    plugins: [
        tailwindScrollbarHide,
        function ({ addComponents }) {
            addComponents({
                ".scrollbar-custom": {
                    "&::-webkit-scrollbar": {
                        width: "8px",
                    },
                    "&::-webkit-scrollbar-track": {
                        backgroundColor: "#f1f1f1",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#888",
                        borderRadius: "10px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#555",
                    },
                },
            });
        },
    ],
};
