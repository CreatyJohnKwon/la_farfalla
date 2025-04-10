import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import AuthProvider from "./utils/layouts/Login/AuthProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "La farfalla (라파팔라)",
    description: "Developed by CreatyJohnKwon",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <AuthProvider>{children}</AuthProvider>
                <Script
                    src="https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js"
                    strategy="beforeInteractive"
                />
            </body>
        </html>
    );
}
