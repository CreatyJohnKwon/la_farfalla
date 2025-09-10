import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { getAuthSession } from "./src/shared/lib/session";
import AuthProvider from "@src/features/providers/AuthProvider";
import RQProvider from "@src/features/providers/RQProvider";
import Sidebar from "@src/widgets/sidebar/Sidebar";
import { Provider as JotaiProvider } from "jotai";
import KakaoFloatingButton from "./src/widgets/button/KakaoFloatingButton";
import NavbarWrapper from "./src/widgets/navbar/NavWrapper";
import Footer from "@src/widgets/footer/Footer";

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

const RootLayout = async ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const session = await getAuthSession();

    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} flex min-h-screen flex-col antialiased`}
            >
                <JotaiProvider>
                    <RQProvider>
                        <AuthProvider session={session}>
                            <main>{children}</main>
                            <Sidebar />
                            <NavbarWrapper />
                            <Footer />
                            <KakaoFloatingButton />
                        </AuthProvider>
                    </RQProvider>
                </JotaiProvider>

                {/* 네이버 로그인 SDK */}
                <Script
                    src="https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js"
                    strategy="beforeInteractive"
                />

                {/* 네이버페이 SDK 추가 */}
                <Script
                    src="https://nsp.pay.naver.com/sdk/js/naverpay.min.js"
                    strategy="beforeInteractive"
                />

                {/* 포트원 SDK */}
                <Script src="https://cdn.portone.io/v2/browser-sdk.js" />
            </body>
        </html>
    );
};

export default RootLayout;
