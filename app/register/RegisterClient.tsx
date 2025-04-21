"use client";

import Navbar from "@/src/widgets/navbar/Navbar";
import { useEffect, useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LoginButton from "../src/components/button/LoginButton";
import OAuth from "@/src/components/button/OAuth";
import useUsers from "@/src/shared/hooks/useUsers";
import { RegisterProps } from "@/src/entities/type/interfaces";

const RegisterClient = ({ registUser }: RegisterProps) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isDisabled, setIsDisabled] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { isOpenOAuth, setIsOpenOAuth } = useUsers();

    const router = useRouter();

    const isPasswordSafe = useMemo(() => {
        return (
            password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /\d/.test(password)
        );
    }, [password]);

    const isPasswordMatch = useMemo(() => {
        return password === confirmPassword && confirmPassword.length > 0;
    }, [password, confirmPassword]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(() => {
            registUser(formData).then((res: any) => {
                if (!res.success) {
                    setError(res.error);
                } else {
                    alert(res.message);
                    router.push("/login");
                }
            });
        });
    };

    useEffect(() => {
        const isValid =
            name.trim() !== "" &&
            email.trim() !== "" &&
            password.length >= 6 &&
            password === confirmPassword;

        setIsDisabled(!isValid);
    }, [name, email, password, confirmPassword]);

    return (
        <>
            <Navbar />
            <div className="flex min-h-[calc(100vh-240px)] flex-col items-center justify-center bg-white px-4 text-center">
                <span className="font-brand mb-10 mt-10 text-5xl transition-all duration-700 ease-in-out sm:mb-16 sm:mt-0 sm:text-8xl">
                    Register
                </span>
                <form
                    className="flex w-5/6 flex-col items-center justify-center gap-4 sm:w-3/6 sm:gap-6"
                    onSubmit={handleSubmit}
                >
                    <div className="flex w-full flex-col gap-4 text-base md:text-lg">
                        {/* 이름 */}
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이름을 입력하세요"
                            className="h-16 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                        {/* 이메일 */}
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="이메일을 입력하세요"
                            className="h-16 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                        {/* 비밀번호 */}
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요 (8자 이상)"
                            className="h-16 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                        {/* 비밀번호 안전도 메시지 */}
                        {password.length > 0 && (
                            <p
                                className={`text-left text-sm ${isPasswordSafe ? "text-green-500" : "text-red-500"}`}
                            >
                                {isPasswordSafe
                                    ? "비밀번호가 안전합니다."
                                    : "8자 이상, 대문자와 숫자를 포함해야 합니다."}
                            </p>
                        )}
                        {/* 비밀번호 확인 */}
                        <input
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호 확인"
                            className="h-16 w-full rounded-xl border border-gray-200 bg-gray-50 px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                        {/* 비밀번호 일치 여부 */}
                        {confirmPassword.length > 0 && (
                            <p
                                className={`text-left text-sm ${isPasswordMatch ? "text-green-500" : "text-red-500"}`}
                            >
                                {isPasswordMatch
                                    ? "비밀번호가 일치합니다."
                                    : "비밀번호가 일치하지 않습니다."}
                            </p>
                        )}
                    </div>

                    {/* 버튼 */}
                    <div className="font-brand flex w-full justify-center gap-4">
                        <LoginButton
                            btnTitle="회원가입"
                            btnColor={`${isDisabled ? "bg-black/50" : "bg-black hover:bg-black/50"} text-white transition-colors`}
                            btnDisabled={isDisabled}
                            btnType="submit"
                        />
                        <LoginButton
                            btnTitle="간편 가입"
                            btnFunc={() => setIsOpenOAuth(true)}
                            btnColor="bg-[#F9F5EB] hover:bg-[#EADDC8] transition-colors"
                            btnType="button"
                        />
                    </div>
                    {error && <p className="text-red-500">{error}</p>}

                    <p className="m-2 w-full border-b" />
                    <Link
                        href={"/login"}
                        className="flex w-full justify-center rounded-md bg-black/10 px-6 py-3 text-base text-black transition-colors duration-300 ease-in-out hover:bg-black/30 sm:text-lg md:text-xl"
                    >
                        로그인으로 돌아가기
                    </Link>
                    {isOpenOAuth && <OAuth />}
                </form>
                {/* {isPending && <p>로딩 중...</p>} */}
            </div>
        </>
    );
};

export default RegisterClient;
