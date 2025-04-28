import { isLoggedInAtom } from "@/src/shared/lib/atom";
import { useAtom } from "jotai";
import { useAtomValue } from "jotai";
import { sessionAtom } from "@/src/shared/lib/atom";
import { signIn } from "next-auth/react";
import { useState } from "react";

const useUsers = () => {
    const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isDisabled, setIsDisabled] = useState<boolean>(false);

    const loginHandler = async (provider: "kakao" | "naver") => {
        await signIn(provider, { redirect: true, callbackUrl: "/login" });
    };

    const sessionCheck = (navData: any) => {
        // const session = useAtomValue(sessionAtom);

        // if (session === null) {
        //     setIsLoggedIn(true);
        //     navData[1].text = "login";
        // } else {
        //     setIsLoggedIn(false);
        //     navData[1].text = "profile";
        // }
    };

    return {
        email,
        password,
        isDisabled,
        isLoggedIn,
        setEmail,
        setPassword,
        setIsDisabled,
        sessionCheck,
        setIsLoggedIn,
        loginHandler,
    };
};

export default useUsers;
