"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { registUserAction } from "./actions";
import { useAddress } from "@src/shared/hooks/useAddress";
import { sendAuthMail } from "@/src/shared/lib/server/user";

import AddressModal from "@src/features/address/AddressModal";
import AgreementModal from "@/src/widgets/modal/Agreement/AgreementModal";
import UserAgreeOne from "@/src/components/agreement/UserAgreeOne";
import UserAgreeTwo from "@/src/components/agreement/UserAgreeTwo";

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

    // 이메일 인증 관련 상태
    const [emailVerificationCode, setEmailVerificationCode] =
        useState<string>("");
    const [authNumber, setAuthNumber] = useState<string>("");
    const [isEmailSent, setIsEmailSent] = useState<boolean>(false);
    const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [showVerificationInput, setShowVerificationInput] =
        useState<boolean>(false);

    const { isOpen, openModal, closeModal, onComplete, formatPhoneNumber } =
        useAddress();

    // 타이머 효과
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isEmailSent) {
            // 시간 만료 시 정리
            setIsEmailSent(false);
            setShowVerificationInput(false);
            setEmailVerificationCode("");

            // 세션 스토리지 정리
            sessionStorage.removeItem("verificationCode");
            sessionStorage.removeItem("verificationEmail");
            sessionStorage.removeItem("verificationExpires");

            console.log("인증 시간이 만료되었습니다.");
        }
        return () => clearInterval(interval);
    }, [timeLeft, isEmailSent]);

    // 시간 포맷팅 함수
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    // 이메일 인증 코드 발송
    const sendEmailVerification = async () => {
        if (!email.trim()) {
            alert("이메일을 입력해주세요.");
            return;
        }

        try {
            // 이메일 발송 API 호출
            const verificationCode = Math.floor(
                100000 + Math.random() * 900000,
            ).toString(); // 6자리 랜덤 코드 생성

            const body = {
                authNumber: verificationCode,
                email: email,
            };

            const response = await sendAuthMail(body);

            if (response.success) {
                // 임시로 생성된 코드를 세션 스토리지에 저장 (실제로는 서버에서 관리)
                sessionStorage.setItem("verificationCode", verificationCode);
                sessionStorage.setItem("verificationEmail", email);
                sessionStorage.setItem(
                    "verificationExpires",
                    (Date.now() + 180000).toString(),
                ); // 3분 후

                setAuthNumber(verificationCode);
                setIsEmailSent(true);
                setShowVerificationInput(true);
                setTimeLeft(180); // 3분 = 180초
                setError(null);
                alert("인증번호가 발송되었습니다. 이메일을 확인해주세요.");
            } else {
                alert("인증번호 발송에 실패했습니다. 채널로 문의해주세요.");
            }
        } catch (error) {
            console.error("이메일 발송 중 오류:", error);
            setError("이메일 발송에 실패했습니다. 다시 시도해주세요.");
        }
    };

    // 이메일 인증 코드 확인
    const verifyEmailCode = async () => {
        if (!emailVerificationCode.trim()) {
            alert("인증번호를 입력해주세요.");
            return;
        }

        try {
            // 임시로 성공 처리 (실제로는 서버에서 검증)
            if (emailVerificationCode === authNumber) {
                // 임시 테스트 코드
                setIsEmailVerified(true);
                setIsEmailSent(false);
                setShowVerificationInput(false);
                setTimeLeft(0);
                setError(null);
                alert("이메일 인증이 완료되었습니다");
            } else {
                setError("인증번호가 올바르지 않습니다.");
                alert("인증번호가 올바르지 않습니다");
            }
        } catch (error) {
            setError("인증 확인에 실패했습니다. 다시 시도해주세요.");
        }
    };

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
        
        // 이메일 인증이 완료되면 요소가 disabled되므로 formData에 포함되지 않음
        // 따라서, disabled된 이메일 필드의 값을 수동으로 추가 해줘야 함
        formData.append("email", email);

        mutation.mutate(formData);
    };

    const isPasswordSafe =
        password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
    const isPasswordMatch =
        password === confirmPassword && confirmPassword.length > 0;
    const isValidForm =
        name.trim() &&
        email.trim() &&
        isEmailVerified && // 이메일 인증 완료 필수
        isPasswordSafe &&
        isPasswordMatch &&
        phoneNumber.replace(/\D/g, "").length >= 10 &&
        address.trim() &&
        detailAddress.trim();

    const onClose = () => {
        if (isOpenUserAgreeOne) setIsOpenUserAgreeOne(false);
        if (isOpenUserAgreeTwo) setIsOpenUserAgreeTwo(false);
    }

    return (
        <div className="z-30 flex h-screen flex-col items-center justify-start overflow-y-auto py-8 text-center">
            <form
                className="mt-5 flex w-[90vw] flex-col items-center justify-start gap-4 p-0 py-8 pb-10 sm:w-1/2 sm:gap-6 sm:pt-20"
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
                    <div className="relative w-full">
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                // 이메일이 변경되면 인증 상태 초기화
                                if (isEmailVerified) {
                                    setIsEmailVerified(false);
                                    setIsEmailSent(false);
                                    setShowVerificationInput(false);
                                    setTimeLeft(0);
                                }
                            }}
                            placeholder="이메일"
                            className="h-[5vh] w-full rounded-none border border-gray-200 bg-gray-50 px-4 pr-28 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                            disabled={isEmailVerified}
                        />
                        {!isEmailVerified && (
                            <button
                                type="button"
                                onClick={sendEmailVerification}
                                disabled={isEmailSent || !email.trim()}
                                className={`absolute right-1 top-1/2 -translate-y-1/2 px-4 py-[1.3vh] text-sm text-white ${
                                    isEmailSent || !email.trim()
                                        ? "cursor-not-allowed bg-gray-400"
                                        : "bg-black hover:bg-gray-800"
                                }`}
                            >
                                {isEmailSent
                                    ? `${formatTime(timeLeft)}`
                                    : "이메일 인증"}
                            </button>
                        )}
                        {isEmailVerified && (
                            <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-2 bg-green-100 px-4 py-[1.3vh] text-sm text-green-800">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                                인증 완료
                            </div>
                        )}

                        {/* 이메일 인증번호 입력 필드 */}
                        <div className="w-full">
                            {showVerificationInput && (
                                <div className="relative w-full">
                                    <input
                                        type="text"
                                        value={emailVerificationCode}
                                        onChange={(e) =>
                                            setEmailVerificationCode(e.target.value)
                                        }
                                        placeholder="인증번호 6자리를 입력하세요"
                                        maxLength={6}
                                        className="h-[5vh] w-full rounded-none border border-blue-200 bg-blue-50 px-4 pr-20 text-gray-700 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={verifyEmailCode}
                                        disabled={
                                            emailVerificationCode.length !== 6
                                        }
                                        className={`absolute right-1 top-1/2 -translate-y-1/2 px-4 py-[1.3vh] text-sm text-white ${
                                            emailVerificationCode.length !== 6
                                                ? "cursor-not-allowed bg-gray-400"
                                                : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                    >
                                        확인
                                    </button>
                                </div>
                            )}

                            {/* 이메일 인증 상태 메시지 */}
                            {isEmailSent && !isEmailVerified && (
                                <div className="text-left">
                                    <p className="text-sm text-blue-600">
                                        {email}
                                        <span className="ms-1 pb-3 text-sm text-gray-700">
                                            로 인증번호를 발송했습니다.
                                        </span>
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {formatTime(timeLeft)} 후에 만료됩니다.
                                        인증번호가 오지 않았다면 스팸함을 확인해주세요.
                                    </p>
                                </div>
                            )}

                            {isEmailVerified && (
                                <div className="text-left">
                                    <p className="text-sm text-green-600">
                                        이메일 인증 완료
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full">
                        {/* 비밀번호 입력 영역 */}
                        <div className="relative w-full">
                            <input
                                type={pwdVisible ? "text" : "password"}
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호 (대소문자 포함, 8자 이상)"
                                className="h-[5vh] w-full rounded-none border border-gray-200 bg-gray-50 px-4 pr-12 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
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

                    {/* 주소 */}
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

                    {/* 상세주소 */}
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

                {/* 가입 조건 안내 */}
                {!isEmailVerified && email.trim() && (
                    <div className="w-full text-left">
                        <p className="text-sm text-red-600">
                            회원가입을 완료하려면 이메일 인증이 필요합니다.
                        </p>
                    </div>
                )}

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
                <AgreementModal 
                    onClose={() => onClose()}
                    children={isOpenUserAgreeOne ? <UserAgreeOne /> : <UserAgreeTwo />}
                /> 
            )}
            {/* children */}
            
        </div>
    );
};

export default RegisterClient;
