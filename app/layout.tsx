import "./globals.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { getAuthSession } from "./src/shared/lib/session";
import AuthProvider from "@src/features/providers/AuthProvider";
import RQProvider from "@src/features/providers/RQProvider";
import Sidebar from "@src/features/sidebar/Sidebar";
import Navbar from "@src/widgets/navbar/Navbar";
import Footer from "@src/widgets/footer/Footer";
import { ScreenLoader } from "./src/widgets/loader/ScreenLoader";
import { Provider as JotaiProvider } from "jotai";

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
                            <Navbar />
                            <Footer />
                            <ScreenLoader />
                        </AuthProvider>
                    </RQProvider>
                </JotaiProvider>
                <Script
                    src="https://static.nid.naver.com/js/naveridlogin_js_sdk_2.0.2.js"
                    strategy="beforeInteractive"
                />
            </body>
        </html>
    );
};

export default RootLayout;
