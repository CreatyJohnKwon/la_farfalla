"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAddress } from "@src/shared/hooks/useAddress";
import AddressModal from "@src/features/address/AddressModal";

import { registUserAction } from "./actions";

import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";
import { X } from "lucide-react";
import UserAgreeOne from "@/src/entities/UserAgreeOne";
import UserAgreeTwo from "@/src/entities/UserAgreeTwo";

const RegisterClient = () => {
    const router = useRouter();

    const [name, setName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [phoneNumber, setPhoneNumber] = useState<string>("");
    const [address, setAddress] = useState<string>("");
    const [detailAddress, setDetailAddress] = useState<string>("");
    const [postcode, setPostcode] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [pwdVisible, setPwdVisible] = useState<boolean>(false);
    const [isOpenUserAgreeOne, setIsOpenUserAgreeOne] =
        useState<boolean>(false);
    const [isOpenUserAgreeTwo, setIsOpenUserAgreeTwo] =
        useState<boolean>(false);

    const { isOpen, openModal, closeModal, onComplete, formatPhoneNumber } =
        useAddress();

    const mutation: any = useMutation({
        mutationFn: (formData: FormData) => registUserAction(formData),
        onSuccess: (res: any) => {
            if (!res.success) {
                setError(res.error);
            } else {
                alert(res.message);
                router.push("/login");
            }
        },
        onError: (error) => {
            setError(
                "회원가입 중 오류가 발생했습니다.\n에러 메세지 : " +
                    error.message,
            );
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isValidForm) return;

        const formData = new FormData(e.currentTarget);
        mutation.mutate(formData);
    };

    const isPasswordSafe =
        password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
    const isPasswordMatch =
        password === confirmPassword && confirmPassword.length > 0;
    const isValidForm =
        name.trim() &&
        email.trim() &&
        isPasswordSafe &&
        isPasswordMatch &&
        phoneNumber.replace(/\D/g, "").length >= 10 &&
        address.trim() &&
        detailAddress.trim();

    return (
        <div className="z-30 flex h-screen flex-col items-center justify-center text-center">
            <form
                className="flex w-[90vw] flex-col items-center justify-center gap-4 p-0 pb-10 sm:w-1/2 sm:gap-6 sm:pt-40"
                onSubmit={handleSubmit}
            >
                <div className="flex w-full flex-col gap-4 text-base md:text-lg c_xl:text-xl">
                    {/* 이름 */}
                    <input
                        type="text"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="이름"
                        className="h-[5vh] w-full rounded-none border border-gray-200 bg-gray-50 px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                    {/* 이메일 */}
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="이메일"
                        className="h-[5vh] w-full rounded-none border border-gray-200 bg-gray-50 px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />

                    <div className="w-full">
                        {/* 비밀번호 입력 영역 */}
                        <div className="relative w-full">
                            <input
                                type={pwdVisible ? "text" : "password"}
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호 (대소문자 포함, 8자 이상)"
                                className="h-[5vh] w-full rounded-none border border-gray-200 bg-gray-50 px-4 pr-12 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200" // ← 오른쪽 패딩 주의!
                            />

                            <button
                                type="button"
                                onClick={() => setPwdVisible(!pwdVisible)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700"
                            >
                                {!pwdVisible ? (
                                    <FaRegEyeSlash size={20} />
                                ) : (
                                    <FaRegEye size={20} />
                                )}
                            </button>
                        </div>

                        {/* 비밀번호 안전도 메시지 */}
                        {password.length > 0 && (
                            <p
                                className={`mt-4 text-left text-sm ${isPasswordSafe ? "text-green-500" : "text-red-500"}`}
                            >
                                {isPasswordSafe
                                    ? "비밀번호가 안전합니다."
                                    : "8자 이상, 대문자와 숫자를 포함해야 합니다."}
                            </p>
                        )}
                    </div>

                    {/* 비밀번호 확인 */}
                    <input
                        type="password"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="비밀번호 확인"
                        className="h-[5vh] w-full rounded-none border border-gray-200 bg-gray-50 px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
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

                    {/* 휴대폰 번호 */}
                    <input
                        type="tel"
                        value={phoneNumber}
                        name="phoneNumber"
                        onChange={(e) => {
                            const raw = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 11);
                            const formatted = formatPhoneNumber(raw);
                            setPhoneNumber(formatted);
                        }}
                        maxLength={phoneNumber.startsWith("02") ? 12 : 13}
                        placeholder="휴대폰 번호"
                        className="h-[5vh] w-full rounded-none border border-gray-200 bg-gray-50 px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                    <div className="relative w-full">
                        <input
                            type="text"
                            name="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="주소"
                            readOnly
                            className="h-[5vh] w-full rounded-none border border-gray-200 bg-gray-50 px-4 pr-28 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                        />
                        <input
                            name="postcode"
                            value={postcode}
                            onChange={(e) => setPostcode(e.target.value)}
                            readOnly
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() =>
                                openModal((value) => {
                                    setAddress(value.address);
                                    setPostcode(value.zonecode);
                                })
                            }
                            className="absolute right-1 top-1/2 -translate-y-1/2 bg-black px-4 py-[1.3vh] text-sm text-white hover:bg-gray-800"
                        >
                            주소찾기
                        </button>
                    </div>
                    <input
                        type="text"
                        name="detailAddress"
                        onChange={(e) => setDetailAddress(e.target.value)}
                        placeholder="상세주소"
                        className="h-[5vh] w-full rounded-none border border-gray-200 bg-gray-50 px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    />
                </div>

                <section className="place-self-start bg-transparent font-pretendard">
                    <label className="flex items-start gap-2 text-sm leading-tight">
                        <input type="checkbox" name="userCertify" required />
                        <div className="-mt-0.5">
                            <button
                                type="button"
                                className="text-blue-900 underline hover:text-blue-500"
                                onClick={() => setIsOpenUserAgreeOne(true)}
                            >
                                이용약관
                            </button>
                            <span>{",\t"}</span>
                            <button
                                type="button"
                                className="text-blue-900 underline hover:text-blue-500"
                                onClick={() => setIsOpenUserAgreeTwo(true)}
                            >
                                개인정보 수집 및 이용
                            </button>
                            에 모두 동의합니다.
                            <span className="text-red-600">{"\t(필수)"}</span>
                        </div>
                    </label>
                </section>

                <section className="place-self-start bg-transparent font-pretendard">
                    <label className="flex items-start gap-2 text-sm leading-tight">
                        <input type="checkbox" name="checkAdult" required />
                        <div className="-mt-0.5">
                            만 14세 이상입니다.
                            <span className="text-red-600">{"\t(필수)"}</span>
                        </div>
                    </label>
                </section>

                {/* 버튼 */}
                <div className="mt-6 flex w-full justify-center gap-4 c_xl:text-xl">
                    <button
                        className={`w-full px-6 py-3 text-white c_xl:py-4 ${!isValidForm || mutation.isLoading ? "bg-black/70" : "bg-black hover:bg-black/70"}`}
                        disabled={!isValidForm || mutation.isLoading}
                        type="submit"
                    >
                        {mutation.isLoading ? "가입 중…" : "가입하기"}
                    </button>
                </div>
                {error && <p className="text-red-500">{error}</p>}

                <p className="m-2 w-full border-b" />
                <Link
                    href={"/login"}
                    className="flex w-full justify-center bg-[#F9F5EB] px-6 py-3 font-pretendard text-base text-black transition-colors duration-300 ease-in-out hover:bg-[#EADDC8] sm:text-lg md:text-base c_xl:py-4 c_xl:text-xl"
                >
                    로그인으로 가기
                </Link>
            </form>
            {isOpen && (
                <AddressModal onComplete={onComplete} onClose={closeModal} />
            )}
            {(isOpenUserAgreeOne || isOpenUserAgreeTwo) && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => {
                        if (isOpenUserAgreeOne) setIsOpenUserAgreeOne(false);
                        if (isOpenUserAgreeTwo) setIsOpenUserAgreeTwo(false);
                    }}
                >
                    <div
                        className="relative h-[60vh] w-[90vw] overflow-hidden bg-white p-4 text-center shadow-xl md:w-1/3"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* 닫기 버튼 */}
                        <button
                            onClick={() => {
                                if (isOpenUserAgreeOne)
                                    setIsOpenUserAgreeOne(false);
                                if (isOpenUserAgreeTwo)
                                    setIsOpenUserAgreeTwo(false);
                            }}
                            className="absolute right-4 top-4 text-zinc-400 transition hover:text-zinc-800"
                            aria-label="닫기"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {isOpenUserAgreeOne && <UserAgreeOne />}
                        {isOpenUserAgreeTwo && <UserAgreeTwo />}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RegisterClient;
