import { isLoggedInAtom, isOpenOAuthAtom } from "@/src/shared/lib/atom";
import { useAtom } from "jotai";
import { useAtomValue } from "jotai";
import { sessionAtom } from "@/src/shared/lib/atom";
import { signIn } from "next-auth/react";
import { useState } from "react";

const useUsers = () => {
    const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);
    const [isOpenOAuth, setIsOpenOAuth] = useAtom(isOpenOAuthAtom);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isDisabled, setIsDisabled] = useState<boolean>(false);

    const loginHandler = async (provider: "kakao" | "naver") => {
        setIsOpenOAuth(false);
        await signIn(provider, { redirect: true, callbackUrl: "/login" });
    };

    const registHandler = async (provider: "kakao" | "naver") => {
        setIsOpenOAuth(false);
        await signIn(provider, { redirect: true, callbackUrl: "/register" });
    }

    const sessionCheck = (navData: any) => {
        const session = useAtomValue(sessionAtom);

        if (session === null) {
            setIsLoggedIn(true);
            navData[1].text = "login";
        } else {
            setIsLoggedIn(false);
            navData[1].text = "profile";
        }
    };

    return {
        email,
        password,
        isDisabled,
        isLoggedIn,
        isOpenOAuth,
        setEmail,
        setPassword,
        setIsDisabled,
        sessionCheck,
        setIsLoggedIn,
        setIsOpenOAuth,
        loginHandler,
        registHandler
    };
};

export default useUsers;
