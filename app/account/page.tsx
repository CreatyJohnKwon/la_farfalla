"use client";

import OAuth from "../utils/layouts/OAuth";

const Account = () => {

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="flex flex-col items-center justify-center h-auto w-full">
                <h1 className="text-4xl c_base:text-7xl font-serif mb-16">Account</h1>
                <OAuth />
            </div>
        </div>
    )
}

export default Account;