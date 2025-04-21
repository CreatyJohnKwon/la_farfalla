import {
    disabledAtom,
    emailAtom,
    isLoggedInAtom,
    isOAuthOpenAtom,
    passwordAtom,
} from "@/src/shared/lib/atom";
import { useAtom } from "jotai";
import { useAtomValue } from "jotai";
import { sessionAtom } from "@/src/shared/lib/atom";
import { signIn } from "next-auth/react";

const useUsers = () => {
    const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);
    const [isOpenOAuth, setIsOpenOAuth] = useAtom(isOAuthOpenAtom);
    const [email, setEmail] = useAtom(emailAtom);
    const [password, setPassword] = useAtom(passwordAtom);
    const [isDisabled, setIsDisabled] = useAtom(disabledAtom);

    const loginHandler = (provider: string | "") => {
        setIsOpenOAuth(false);
        signIn(provider, { redirect: true, callbackUrl: "/" });
    };

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
    };
};

export default useUsers;
