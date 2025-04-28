import { signIn } from "next-auth/react";
import { navData, menuData } from "@/src/entities/db/menuDatas";

const loginAction = async (formData: FormData) => {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        alert("이메일과 비밀번호를 모두 입력해주세요");
        return;
    }

    const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/home",
    });

    if (!res?.ok) {
        alert(res?.error || "로그인 실패");
        return;
    }

    menuData[1].text = "Profile";
    menuData[1].link = "/profile";
    navData[1].text = "profile";
    window.location.href = res.url ?? "/home";
};

export { 
    loginAction
};