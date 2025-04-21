import { redirect } from "next/navigation";

export const shareMeal = async (formData: FormData) => {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email) {
        alert("이메일을 입력해주세요");
        return;
    }

    if (!password) {
        alert("비밀번호를 입력해주세요");
        return;
    }

    const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    // 400 이상 에러 처리
    if (!res.ok) {
        alert(data.error);
        return;
    }

    alert("로그인 성공!");
    redirect("/");
};
