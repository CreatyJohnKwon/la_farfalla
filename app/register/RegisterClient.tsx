"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { FaRegEye } from "react-icons/fa6";
import { FaRegEyeSlash } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { registUserAction } from "./actions";
import { useAddress } from "@src/shared/hooks/useAddress";
import { sendAuthMail } from "@src/shared/lib/server/user";

import AddressModal from "@src/widgets/modal/address/AddressModal";
import AgreementModal from "@/src/widgets/modal/agreement/AgreementModal";
import UserAgreeOne from "@src/components/agreement/UserAgreeOne";
import UserAgreeTwo from "@src/components/agreement/UserAgreeTwo";

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
    const [pwdVisible, setPwdVisible] = useState<boolean>(false);
    const [isOpenUserAgreeOne, setIsOpenUserAgreeOne] = useState<boolean>(false);
    const [isOpenUserAgreeTwo, setIsOpenUserAgreeTwo] = useState<boolean>(false);
    
    // ◀️ 변경: 서버 에러 및 폼 유효성 에러 상태 분리
    const [serverError, setServerError] = useState<string | null>(null);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false); // ◀️ 추가: 제출 버튼 클릭 여부 상태

    // 이메일 인증 관련 상태
    const [emailVerificationCode, setEmailVerificationCode] = useState<string>("");
    const [authNumber, setAuthNumber] = useState<string>("");
    const [isEmailSent, setIsEmailSent] = useState<boolean>(false);
    const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [showVerificationInput, setShowVerificationInput] = useState<boolean>(false);

    const { isOpen, openModal, closeModal, onComplete, formatPhoneNumber } = useAddress();

    // ◀️ 추가: 유효성 검사 함수
    const validate = () => {
        const newErrors: { [key: string]: string } = {};

        // 이름
        if (!name.trim()) newErrors.name = "이름을 입력해주세요.";

        // 이메일
        if (!email.trim()) {
            newErrors.email = "이메일을 입력해주세요.";
        } else if (!isEmailVerified) {
            newErrors.email = "이메일 인증을 완료해주세요.";
        }

        // 비밀번호
        const isPasswordSafe = password.length >= 8 && /[A-Z]/.test(password) && /\d/.test(password);
        if (!password) {
            newErrors.password = "비밀번호를 입력해주세요.";
        } else if (!isPasswordSafe) {
            newErrors.password = "8자 이상, 대문자와 숫자를 포함해야 합니다.";
        }

        // 비밀번호 확인
        if (!confirmPassword) {
            newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
        }
        
        // 휴대폰 번호
        if (phoneNumber.replace(/\D/g, "").length < 10) {
            newErrors.phoneNumber = "올바른 휴대폰 번호를 입력해주세요.";
        }

        // 주소
        if (!address.trim()) newErrors.address = "주소를 입력해주세요.";
        if (!detailAddress.trim()) newErrors.detailAddress = "상세주소를 입력해주세요.";
        
        return newErrors;
    };

    // ◀️ 추가: 입력값이 변경될 때마다 유효성 검사 재실행 (제출 시도 이후에만)
    useEffect(() => {
        if (isSubmitted) {
            setErrors(validate());
        }
    }, [name, email, password, confirmPassword, phoneNumber, address, detailAddress, isEmailVerified, isSubmitted]);

    useEffect(() => {
        if (serverError === null ||
            serverError === undefined ||
            serverError === "") return;

        alert(serverError);
    }, [serverError])

    // 타이머 효과
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1);
            }, 1000);
        } else if (timeLeft === 0 && isEmailSent) {
            setIsEmailSent(false);
            setShowVerificationInput(false);
            setEmailVerificationCode("");
            sessionStorage.removeItem("verificationCode");
            sessionStorage.removeItem("verificationEmail");
            sessionStorage.removeItem("verificationExpires");
            alert("인증 시간이 만료되었습니다.");
        }
        return () => clearInterval(interval);
    }, [timeLeft, isEmailSent]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    const sendEmailVerification = async () => {
        if (!email.trim()) {
            alert("이메일을 입력해주세요.");
            return;
        }

        alert("인증번호가 발송되었습니다. 이메일을 확인해주세요.");

        try {
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const body = { authNumber: verificationCode, email: email };

            sessionStorage.setItem("verificationCode", verificationCode);
            sessionStorage.setItem("verificationEmail", email);
            sessionStorage.setItem("verificationExpires", (Date.now() + 180000).toString());

            setAuthNumber(verificationCode);
            setIsEmailSent(true);
            setShowVerificationInput(true);
            setTimeLeft(180);
            setServerError(null);

            const response = await sendAuthMail(body);
            if (!response.success) alert("인증번호 발송에 실패했습니다. 채널로 문의해주세요.");
        } catch (error) {
            console.error("이메일 발송 중 오류:", error);
            setServerError("이메일 발송에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const verifyEmailCode = async () => {
        if (!emailVerificationCode.trim()) {
            alert("인증번호를 입력해주세요.");
            return;
        }

        try {
            if (emailVerificationCode === authNumber) {
                setIsEmailVerified(true);
                setIsEmailSent(false);
                setShowVerificationInput(false);
                setTimeLeft(0);
                setServerError(null);
                setErrors(prev => ({...prev, email: ''})); // ◀️ 이메일 에러 초기화
                alert("이메일 인증이 완료되었습니다");
            } else {
                alert("인증번호가 올바르지 않습니다");
            }
        } catch (error) {
            setServerError("인증 확인에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const mutation: any = useMutation({
        mutationFn: (formData: FormData) => registUserAction(formData),
        onSuccess: (res: any) => {
            if (!res.success) {
                setServerError(res.error);
            } else {
                alert(res.message);
                router.push("/login");
            }
        },
        onError: (error) => {
            setServerError("회원가입 중 오류가 발생했습니다.\n에러 메세지 : " + error.message);
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitted(true); // ◀️ 추가: 제출 시도 상태를 true로 변경
        
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            // ◀️ 첫번째 에러 필드로 포커스 이동 (선택적)
            const firstErrorKey = Object.keys(validationErrors)[0];
            const firstErrorElement = document.getElementsByName(firstErrorKey)[0];
            if (firstErrorElement) {
                firstErrorElement.focus();
            }
            return;
        }
        
        const formData = new FormData(e.currentTarget);
        formData.append("email", email);
        mutation.mutate(formData);
    };

    const onClose = () => {
        if (isOpenUserAgreeOne) setIsOpenUserAgreeOne(false);
        if (isOpenUserAgreeTwo) setIsOpenUserAgreeTwo(false);
    }
    
    // ◀️ 변경: 유효성 검사 결과를 `errors` 객체의 키 개수로 판단
    const isValidForm = Object.keys(errors).length === 0 && isSubmitted;

    return (
        <div className="z-30 flex h-screen flex-col items-center justify-start overflow-y-auto py-8 text-center">
            <form
                className="mt-5 flex w-[90vw] flex-col items-center justify-start gap-4 p-0 py-8 pb-10 sm:w-1/2 sm:gap-6 sm:pt-20"
                onSubmit={handleSubmit}
                noValidate // ◀️ 추가: 브라우저 기본 유효성 검사 비활성화
            >
                <div className="flex w-full flex-col gap-4 text-sm md:text-lg c_xl:text-xl">
                    {/* 이름 */}
                    <div className="w-full"> {/* ◀️ 추가: 에러 메시지를 위한 div */}
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="이름"
                            // ◀️ 변경: 조건부 클래스 적용
                            className={`h-[5vh] w-full rounded-none border bg-gray-50 px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                                errors.name ? 'border-red-500 focus:ring-red-300' : 'border-gray-200 focus:ring-gray-200'
                            }`}
                        />
                        {/* ◀️ 추가: 에러 메시지 표시 */}
                        {errors.name && <p className="mt-1 text-left text-xs text-red-500">{errors.name}</p>}
                    </div>

                    {/* 이메일 */}
                    <div className="w-full">
                        <div className={`flex h-[5vh] w-full items-center rounded-none border bg-gray-50 pr-1 focus-within:ring-2 ${
                                errors.email ? 'border-red-500 ring-red-300' : 'border-gray-200 ring-gray-200'
                            }`}>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (isEmailVerified) {
                                        setIsEmailVerified(false);
                                        setIsEmailSent(false);
                                        setShowVerificationInput(false);
                                        setTimeLeft(0);
                                    }
                                }}
                                placeholder="이메일"
                                className="h-full flex-1 bg-transparent px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none"
                                disabled={isEmailVerified}
                            />
                            {!isEmailVerified && (
                                <button
                                    type="button"
                                    onClick={sendEmailVerification}
                                    disabled={isEmailSent || !email.trim()}
                                    className={`flex-shrink-0 whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-medium bg-transparent
                                        ${ isEmailSent || !email.trim()
                                            ? "cursor-not-allowed text-gray-400" 
                                            : "text-black underline hover:text-gray-600"
                                        }`}
                                >
                                    {isEmailSent ? `${formatTime(timeLeft)}` : "이메일 인증"}
                                </button>
                            )}
                            {isEmailVerified && (
                                <div className="flex flex-shrink-0 items-center gap-2 px-4 text-xs sm:text-sm text-green-600">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    인증 완료
                                </div>
                            )}
                        </div>
                        {errors.email && <p className="mt-1 text-left text-xs text-red-500">{errors.email}</p>}

                        {/* 이메일 인증번호 입력 필드 */}
                        {showVerificationInput && (
                            <div className="relative mt-2 flex h-[5vh] w-full items-center rounded-none border border-blue-200 bg-blue-50 pr-1 focus-within:ring-2 focus-within:ring-blue-50">
                                <input
                                    type="text"
                                    value={emailVerificationCode}
                                    onChange={(e) => setEmailVerificationCode(e.target.value)}
                                    placeholder="인증번호 6자리를 입력하세요"
                                    maxLength={6}
                                    className="h-full flex-1 bg-transparent px-4 text-gray-700 placeholder:text-gray-500 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={verifyEmailCode}
                                    disabled={emailVerificationCode.length !== 6}
                                    className={`flex-shrink-0 px-4 py-[1.3vh] text-xs sm:text-sm font-medium ${
                                        emailVerificationCode.length !== 6
                                            ? "cursor-not-allowed text-gray-400"
                                            : "text-blue-600 hover:text-blue-700 underline"
                                    }`}
                                >
                                    확인
                                </button>
                            </div>
                        )}

                        {/* 이메일 인증 상태 메시지 */}
                        {isEmailSent && !isEmailVerified && (
                            <div className="mt-2 text-left">
                                <p className="text-xs sm:text-sm text-blue-600">
                                    {email}
                                    <span className="ms-1 pb-3 text-xs sm:text-sm text-gray-700">
                                        로 인증번호를 발송했습니다.
                                    </span>
                                </p>
                                <p className="mt-1 text-xs text-gray-500">
                                    {formatTime(timeLeft)} 후에 만료됩니다.
                                    인증번호가 오지 않았다면 스팸함을 확인해주세요.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="w-full">
                        <div className={`flex h-[5vh] w-full items-center rounded-none border bg-gray-50 focus-within:ring-2 ${
                            errors.password ? 'border-red-500 ring-red-300' : 'border-gray-200 ring-gray-200'
                        }`}>
                            <input
                                type={pwdVisible ? "text" : "password"}
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="비밀번호 (대소문자 포함, 8자 이상)"
                                className="h-full flex-1 bg-transparent px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setPwdVisible(!pwdVisible)}
                                className="p-3 text-gray-500 hover:text-gray-700"
                            >
                                {!pwdVisible ? <FaRegEyeSlash size={20} /> : <FaRegEye size={20} />}
                            </button>
                        </div>
                        {errors.password && <p className="mt-1 text-left text-xs text-red-500">{errors.password}</p>}
                    </div>

                    {/* 비밀번호 확인 */}
                    <div className="w-full">
                         <input
                            type="password"
                            name="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호 확인"
                            className={`h-[5vh] w-full rounded-none border bg-gray-50 px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                                errors.confirmPassword ? 'border-red-500 focus:ring-red-300' : 'border-gray-200 focus:ring-gray-200'
                            }`}
                        />
                        {errors.confirmPassword && <p className="mt-1 text-left text-xs text-red-500">{errors.confirmPassword}</p>}
                    </div>

                    {/* 휴대폰 번호 */}
                    <div className="w-full">
                        <input
                            type="tel"
                            value={phoneNumber}
                            name="phoneNumber"
                            onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, "").slice(0, 11);
                                const formatted = formatPhoneNumber(raw);
                                setPhoneNumber(formatted);
                            }}
                            maxLength={phoneNumber.startsWith("02") ? 12 : 13}
                            placeholder="휴대폰 번호"
                            className={`h-[5vh] w-full rounded-none border bg-gray-50 px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                                errors.phoneNumber ? 'border-red-500 focus:ring-red-300' : 'border-gray-200 focus:ring-gray-200'
                            }`}
                        />
                        {errors.phoneNumber && <p className="mt-1 text-left text-xs text-red-500">{errors.phoneNumber}</p>}
                    </div>

                    {/* 주소 */}
                    <div className="w-full">
                        <div className={`flex h-[5vh] w-full items-center rounded-none border bg-gray-50 pr-1 focus-within:ring-2 ${
                            errors.address ? 'border-red-500 ring-red-300' : 'border-gray-200 ring-gray-200'
                        }`}>
                            <input
                                type="text"
                                name="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="주소"
                                readOnly
                                className="h-full flex-1 cursor-pointer bg-transparent px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none"
                            />
                            <input name="postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} readOnly className="hidden" />
                            <button
                                type="button"
                                onClick={() => openModal((value) => {
                                    setAddress(value.address);
                                    setPostcode(value.zonecode);
                                })}
                                className="flex-shrink-0 whitespace-nowrap px-3 py-2 text-xs sm:text-sm font-medium text-black underline hover:text-gray-600"
                            >
                                주소찾기
                            </button>
                        </div>
                        {errors.address && <p className="mt-1 text-left text-xs text-red-500">{errors.address}</p>}
                    </div>
                    {/* 상세주소 */}
                    <div className="w-full">
                        <input
                            type="text"
                            name="detailAddress"
                            onChange={(e) => setDetailAddress(e.target.value)}
                            placeholder="상세주소"
                            className={`h-[5vh] w-full rounded-none border bg-gray-50 px-4 text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 ${
                                errors.detailAddress ? 'border-red-500 focus:ring-red-300' : 'border-gray-200 focus:ring-gray-200'
                            }`}
                        />
                        {errors.detailAddress && <p className="mt-1 text-left text-xs text-red-500">{errors.detailAddress}</p>}
                    </div>
                </div>

                <section className="place-self-start bg-transparent font-pretendard">
                    <label className="flex items-start gap-2 text-xs sm:text-sm leading-tight">
                        <input type="checkbox" name="userCertify" required={true} />
                        <div className="-mt-1">
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
                    <label className="flex items-start gap-2 text-xs sm:text-sm leading-tight">
                        <input type="checkbox" name="checkAdult" required={true} />
                        <div className="-mt-1">
                            만 14세 이상입니다.
                            <span className="text-red-600">{"\t(필수)"}</span>
                        </div>
                    </label>
                </section>

                {!isEmailVerified && email.trim() && (
                    <div className="w-full text-left">
                        <p className="text-xs sm:text-sm text-red-600">
                            회원가입을 완료하려면 이메일 인증이 필요합니다.
                        </p>
                    </div>
                )}

                <div className="mt-6 flex w-full justify-center gap-4 c_xl:text-xl">
                    <button
                        className={`w-full px-6 py-3 text-white c_xl:py-4 ${mutation.isLoading ? "bg-black/50" : "bg-black hover:bg-black/70"}`}
                        disabled={mutation.isLoading} // ◀️ 로딩 중에만 비활성화
                        type="submit"
                    >
                        {mutation.isLoading ? "가입 중…" : "가입하기"}
                    </button>
                </div>
                {serverError && <p className="text-red-500">{serverError}</p>}

                <p className="m-2 w-full border-b" />
                <Link
                    href={"/login"}
                    className="flex w-full justify-center bg-[#F9F5EB] px-6 py-3 font-pretendard text-base text-black transition-colors duration-300 ease-in-out hover:bg-[#EADDC8] sm:text-lg md:text-base c_xl:py-4 c_xl:text-xl"
                >
                    로그인으로 가기
                </Link>
            </form>

            {isOpen && (
                <AddressModal 
                    onComplete={onComplete} 
                    onClose={closeModal} 
                />
            )}
            {(isOpenUserAgreeOne || isOpenUserAgreeTwo) && (
                <AgreementModal 
                    onClose={() => onClose()}
                    children={isOpenUserAgreeOne ? <UserAgreeOne /> : <UserAgreeTwo />}
                /> 
            )}
        </div>
    );
};

export default RegisterClient;