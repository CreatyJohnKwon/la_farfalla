import tailwindScrollbarHide from "tailwind-scrollbar-hide";

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            letterSpacing: {
                tightest: "-0.075em",
            },
            fontFamily: {
                pretendard: ["Pretendard Variable", "sans-serif"],
            },
            screens: {
                c_xl: "1850px",
                c_lg: "1610px",
                c_md: "1105px",
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
