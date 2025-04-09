"use client";

import OAuth from "../utils/layouts/Login/OAuth";

const Login = () => {

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="flex flex-col items-center justify-center h-auto w-full">
                <h1 className="text-4xl c_base:text-7xl font-brand mb-16">Login</h1>
                <OAuth />
            </div>
        </div>
    )
}

export default Login;