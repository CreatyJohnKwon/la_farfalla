"use client";

import OAuth from "../utils/layouts/Login/OAuth";

const Login = () => {
    return (
        <div className="flex h-screen flex-col items-center justify-center">
            <div className="flex h-auto w-full flex-col items-center justify-center">
                <h1 className="font-brand mb-16 text-4xl c_base:text-7xl">
                    Login
                </h1>
                <OAuth />
            </div>
        </div>
    );
};

export default Login;
