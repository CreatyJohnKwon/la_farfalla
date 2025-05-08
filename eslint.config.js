const js = require("@eslint/js");
const globals = require("globals");
const reactHooks = require("eslint-plugin-react-hooks");

module.exports = [
    {
        files: ["**/*.{ts,tsx}"],
        parser: "@typescript-eslint/parser",
        parserOptions: {
            ecmaVersion: 2020,
            sourceType: "module",
            ecmaFeatures: {
                jsx: true,
            },
        },
        extends: [
            js.configs.recommended,
            "plugin:@typescript-eslint/recommended",
            "plugin:react/recommended",
            "plugin:next/recommended", // next 플러그인 설정
        ],
        plugins: [
            "react-hooks",
            "react-refresh",
            "@typescript-eslint",
            "next", // next 플러그인 추가
        ],
        rules: {
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
        },
        globals: {
            ...globals.browser,
        },
    },
];
