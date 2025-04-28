import { signIn } from "next-auth/react";

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

    if (res?.ok) {
        if (res.url) {
            window.location.href = res.url;
        } else {
            window.location.href = "/home";
        }
        return;
    } else {
        alert(res?.error || "로그인 실패");
        return;
    }
};

export default loginAction;
