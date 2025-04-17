import { isLoggedInAtom, isOAuthOpenAtom } from "@/src/shared/lib/atom";
import { useAtom } from "jotai";
import { useAtomValue } from "jotai";
import { sessionAtom } from "@/src/shared/lib/atom";
import { signIn } from "next-auth/react";

const useUsers = () => {
    const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);
    const [isOpenOAuth, setIsOpenOAuth] = useAtom(isOAuthOpenAtom);

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

    const handleAccountBtn = (title: string) => {
        alert(`${title} 기능 개발중입니다`);
    };

    const loginHandler = (provider: string | "") => {
        setIsOpenOAuth(false);
        signIn(provider, { redirect: true, callbackUrl: "/" });
    };

    return {
        isLoggedIn,
        isOpenOAuth,
        sessionCheck,
        setIsLoggedIn,
        setIsOpenOAuth,

        loginHandler,
        handleAccountBtn,
    };
};

export default useUsers;
