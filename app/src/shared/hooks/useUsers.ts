import { isLoggedInAtom } from "@src/shared/lib/atom";
import { useAtom } from "jotai";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SessionProps {
    name: string;
    email: string;
    _id: string;
}

const useUsers = () => {
    const [isLoggedIn, setIsLoggedIn] = useAtom<boolean>(isLoggedInAtom);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
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
              { text: "Profile", link: "/profile" },
              { text: "Shop", link: "/shop" },
              { text: "Introduce", link: "/introduce" },
              { text: "Notice", link: "/notice" },
          ]
        : [
              { text: "Login", link: "/login" },
              { text: "Shop", link: "/shop" },
              { text: "Introduce", link: "/introduce" },
              { text: "Notice", link: "/notice" },
          ];

    const navStartData = session
        ? [{ text: "cart" }, { text: "profile" }, {text: "logout"}]
        : [{ text: "cart" }, { text: "login" }];

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

        menusData,
        session,
        navStartData,

        authCheck,
    };
};

export default useUsers;
