"use client";

import Navbar from "@/src/widgets/Navbar/Navbar";
import OAuth from "../src/features/Login/OAuth";

const LoginClient = () => {
    return (
        <>
            <Navbar />
            <div className="flex h-full flex-col">
                <div className="flex min-h-[calc(100vh-250px)] flex-col items-center justify-center px-4 text-center">
                    <span className="font-brand mb-16 text-5xl c_base:text-7xl">
                        Login
                    </span>
                    <OAuth />
                </div>
            </div>
        </>
    );
};

export default LoginClient;
