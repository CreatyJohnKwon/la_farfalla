import { isLoggedInAtom } from "@/src/shared/lib/atom";
import { useAtom } from "jotai";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { signOut } from "next-auth/react";

const useUsers = () => {
    const [isLoggedIn, setIsLoggedIn] = useAtom<boolean>(isLoggedInAtom);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isDisabled, setIsDisabled] = useState<boolean>(false);

    const loginHandler = async (provider: "kakao" | "naver") => {
        await signIn(provider, {
            redirect: true,
            callbackUrl: "/home",
        });
    };

    const logoutHandler = () => {
        const result = confirm("로그아웃 하시겠습니까?");
        if (result) signOut({ callbackUrl: "/" });
    };

    return {
        email,
        password,
        isDisabled,
        isLoggedIn,

        setEmail,
        setPassword,
        setIsDisabled,
        setIsLoggedIn,

        loginHandler,
        logoutHandler,
    };
};

export default useUsers;
