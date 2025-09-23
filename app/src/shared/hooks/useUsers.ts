import { isLoggedInAtom } from "@src/shared/lib/atom";
import { useAtom } from "jotai";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const useUsers = () => {
    const [isLoggedIn, setIsLoggedIn] = useAtom<boolean>(isLoggedInAtom);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();

    const authCheck = (): boolean => {
        if (!session) {
            if (
                confirm("로그인을 해주세요.\n로그인 창으로 이동하시겠습니까?")
            ) {
                router.replace("/login");
            }
            return false;
        } else return true;
    };

    const loginHandler = async (provider: "kakao" | "naver") => {
        await signIn(provider, {
            rememberMe,
            redirect: true,
            callbackUrl: "/home",
        });
    };

    const logoutHandler = () => {
        const result = confirm("로그아웃 하시겠습니까?");
        if (result) signOut({ callbackUrl: "/home" });
    };

    const menusData = session
        ? [
              { text: "PROFILE", link: "/profile" },
              { text: "SHOP", link: "/shop" },
              { text: "INTRODUCE", link: "/introduce" },
          ]
        : [
              { text: "LOGIN", link: "/login" },
              { text: "SHOP", link: "/shop" },
              { text: "INTRODUCE", link: "/introduce" },
          ];

    const navStartData = session
        ? [{ text: "CART" }, { text: "PROFILE" }, {text: "LOGOUT"}]
        : [{ text: "CART" }, { text: "LOGIN" }];

    return {
        email,
        password,
        isDisabled,
        isLoggedIn,
        rememberMe,

        setEmail,
        setPassword,
        setIsDisabled,
        setIsLoggedIn,
        setRememberMe,

        loginHandler,
        logoutHandler,

        menusData,
        session,
        navStartData,

        authCheck,
    };
};

export default useUsers;
